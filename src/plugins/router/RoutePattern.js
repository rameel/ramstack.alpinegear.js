import {
    as_array,
    is_nullish
} from "@/utilities/utils";

const default_constraints = Object.freeze({
    "regex"(value) {
        const regexp = new RegExp(value);
        return {
            test: v => regexp.test(v)
        };
    },
    "bool"() {
        return {
            test: v => /^(?:true|false)$/i.test(v),
            transform: v => v.length === 4
        };
    },
    "int"() {
        return {
            test: v => /^-?\d+$/.test(v),
            transform: v => +v
        };
    },
    "number"() {
        return {
            test: v => /^[-+]?\d*\.?\d+(?:[eE][-+]?\d+)?$/.test(v) && isFinite(parseFloat(v)),
            transform: v => parseFloat(v)
        };
    },
    "alpha"() {
        return {
            test: v => /^[a-z]+$/i.test(v)
        };
    },
    "min"(value) {
        return {
            test: v => v >= +value
        };
    },
    "max"(value) {
        return {
            test: v => v <= +value
        };
    },
    "range"(value) {
        let [a, b] = value.split(",", 2).map(v => v.trim());
        return {
            test: v => v >= +a && v <= +b
        };
    },
    "length"(value) {
        let values = value.split(",").map(v => v.trim());
        return {
            test: values.length == 2
                ? v => v.length >=  +values[0] && v.length <= +values[1]
                : v => v.length === +values[0]
        };
    },
    "minlength"(value) {
        return {
            test: v => v.length >= +value
        };
    },
    "maxlength"(value) {
        return {
            test: v => v.length <= +value
        };
    },
});

export class RoutePattern {
    #regex;
    #template;
    #segments;
    #parameters;
    #constraints;

    get template() {
        return this.#template;
    }

    get regex() {
        return this.#regex;
    }

    get constraints() {
        return this.#constraints;
    }

    constructor(template, constraints = null) {
        this.#template = template;
        this.#regex = build_regex(
            template,
            this.#segments = [],
            this.#parameters = new Map(),
            this.#constraints = constraints ?? {}
        );
    }

    match(path) {
        let result = this.#regex.exec(path);

        if (is_nullish(result)) {
            return null;
        }

        result = result.groups ?? {};

        for (let [name, parameter] of this.#parameters.entries()) {
            let value = result[name];

            if (is_nullish(value) && is_nullish(parameter.default)) {
                continue;
            }

            if (!value && !is_nullish(parameter.default)) {
                value = parameter.default;
            }

            const values = parameter.catch_all
                ? value.split("/").filter(v => v.length)
                : [value];

            for (let i = 0; i < values.length; i++) {
                for (let constraint of parameter.constraints) {
                    if (constraint.test && !constraint.test(values[i])) {
                        return null;
                    }

                    if (constraint.transform) {
                        values[i] = constraint.transform(values[i]);
                    }
                }
            }

            result[name] = parameter.catch_all ? values : values[0];
        }

        return result;
    }

    resolve(values) {
        values = new Map(Object.entries(values));
        const segments = [];

        for (let segment of this.#segments) {
            const parts = [];

            for (let part of segment.parts) {
                if (part.kind === "literal") {
                    parts.push(part.value);
                }
                else {
                    let value = values.get(part.name);
                    values.delete(part.name);

                    if (is_nullish(value) || value === "") {
                        value = this.#parameters.get(part.name)?.default;
                        if (part.catch_all && value) {
                            value = value.split("/");
                        }
                    }

                    if (is_nullish(value) || value === "") {
                        if (part.required) {
                            return null;
                        }

                        // TODO Check twice
                        if (part.optional && part.default === value) {
                            continue;
                        }
                    }

                    if (part.catch_all) {
                        value = as_array(value);
                        parts.push(...value.map(v => encodeURIComponent(v)).join("/"));
                    }
                    else {
                        parts.push(encodeURIComponent(value));
                    }
                }
            }

            parts.length && segments.push(parts.join(""));
        }

        let queries = [...values.entries()].map(([k, v]) => encodeURIComponent(k) + "=" + encodeURIComponent(v)).join("&");
        queries && (queries = "?" + queries);

        const result = segments.join("/") + queries;
        return result[0] !== "/"
            ? "/" + result
            : result;
    }
}

function build_regex(pattern, segments, parameters, constraints) {
    segments.push(...parse_route_pattern(pattern, constraints));

    let expression = segments.map(segment => {
        return segment.parts.map((part, index) => {
            if (part.kind === "literal") {
                return index ? part.value : `/${ part.value }`;
            }

            parameters.set(part.name, part);

            if (segment.parts.length === 1 && part.quantifier === "?") {
                return `(?:/(?<${ part.name }>[^/]+?))?`;
            }

            if (part.catch_all) {
                let expr = `(?<${ part.name }>.${ part.quantifier })`;
                index || (expr = `(?:/${ expr })`);
                part.quantifier === "*" && (expr += "?");
                return part.quantifier === "*" ? expr + "?" : expr;
            }
            else {
                const expr = `(?<${ part.name }>[^/]+?)${ part.quantifier }`;
                return index ? expr : `/${ expr }`;
            }
        }).join("");
    }).join("") || "/";

    expression !== "/" && (expression += "/?");
    return new RegExp(`^${ expression }$`);
}

function parse_route_pattern(pattern, factories) {
    return preprocess_segments(parse_segments());

    function preprocess_segments(segments) {
        if (segments.find(s => s.parts.length > 1 && s.parts.every(p => p.optional))) {
            throw_error("Using all segment parameters as optional is not permitted");
        }

        const parameters = new Map;

        segments.flatMap(s => s.parts).forEach((part, index, parts) => {
            if (part.kind === "literal" && part.value.indexOf("?") >= 0) {
                throw_error("Literal segments cannot contain the '?' character");
            }

            if (part.kind === "parameter") {
                if (part.catch_all && index !== parts.length - 1) {
                    throw_error("A catch-all parameter can only appear as the last segment");
                }

                if (parameters.has(part.name)) {
                    throw_error(`The route parameter name '${part.name}' appears more than one time`);
                }

                part.quantifier === "*"
                    && is_nullish(part.default)
                    && (part.default = "");

                part.default === ""
                    && part.quantifier !== "*"
                    && (part.default = null);

                parameters.set(part.name, true);

                for (let constraint of part.constraints) {
                    const factory = factories?.[constraint.name] ?? default_constraints[constraint.name];
                    is_nullish(factory) && throw_error(`Unknown constraint '${ constraint.name }'`);
                    Object.assign(constraint, factory(constraint.argument));
                }
            }
        });

        return segments;
    }

    function parse_segments() {
        const segments = [];

        for (let i = 0; i < pattern.length;) {
            const segment = parse_segment(i);
            segment.template && segments.push(segment);
            i += segment.template.length + 1;
        }

        return segments;
    }

    function parse_segment(pos) {
        let parts = [];
        let index = pos;

        while (index < pattern.length && pattern[index] !== "/") {
            const part = parse_literal(index) || parse_parameter(index);
            parts.push(part);

            index += part.template.length;
        }

        return {
            template: pattern.slice(pos, index),
            parts: parts
        }
    }

    function parse_constraints(text, p) {
        const array = [];

        for (let i = p; i < text.length;) {
            if (text[i] !== ":") {
                throw_error();
            }

            const name = get_constraint_name(text.slice(i + 1));
            i += name.length + 1;

            const arg = text[i] === "("
                ? get_parameter_template(i, text)
                : null;

            is_nullish(arg) || (i += arg.length + 2);

            if (!name && !arg) {
                throw_error();
            }

            array.push({
                name: name === "=" ? "default" : name || "regex",
                argument: arg ?? ""
            });

        }

        return array;
    }

    function parse_parameter(p) {
        if (pattern[p] !== "{") {
            return null;
        }

        const template = get_parameter_template(p);
        const parameter_template = pattern.slice(p, p + template.length + 2);
        const name = get_parameter_name(template);
        const quantifier = /[*+?]/.exec(template[name.length])?.[0] ?? "";
        const list = parse_constraints(template, name.length + quantifier.length);

        return {
            name: name,
            kind: "parameter",
            template: parameter_template,
            quantifier: quantifier,
            constraints: list.filter(c => c.name !== "default"),
            default: list.find(c => c.name === "default")?.argument,
            required: quantifier === "+" || quantifier === "",
            optional: quantifier === "?" || quantifier === "*",
            catch_all: quantifier === "+" || quantifier === "*"
        };
    }

    function parse_literal(pos) {
        for (let i = pos; ; i++) {
            if (i >= pattern.length || pattern[i] === "/" || pattern[i] === "{") {
                if (i === pos) {
                    return null;
                }

                const template = pattern.slice(pos, i);
                return {
                    kind: "literal",
                    template: template,
                    value: template
                };
            }
        }
    }

    function get_parameter_template(pos, str) {
        str ??= pattern;
        const stack = [];

        loop: for (let i = pos; i < str.length; i++) {
            switch (str[i]) {
                case "{": stack.push("}"); break;
                case "(": stack.push(")"); break;
                case "}":
                case ")":
                    if (stack.pop() !== str[i]) break loop;
                    break;
            }

            if (stack.length === 0) {
                return str.slice(pos + 1, i);
            }
        }

        throw_error();
    }

    function get_parameter_name(value) {
        const name = value.match(/^(?<name>[a-z_$][a-z0-9_$-]*?)(?:[:?+*]|$)/i)?.groups?.name;
        is_nullish(name) && throw_error("Invalid parameter name");

        return name;
    }

    function get_constraint_name(value) {
        const name = value.match(/^(?<name>=|[a-z0-9_$]*)(?=[/:(]|$)/i)?.groups?.name;
        is_nullish(name) && throw_error("Invalid constraint name");

        return name;
    }

    function throw_error(message = "Invalid pattern") {
        throw new Error(`${ message }: ${ pattern }`);
    }
}
