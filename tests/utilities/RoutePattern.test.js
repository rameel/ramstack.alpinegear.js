import { assert, describe, expect, test } from "vitest";
import { RoutePattern } from "@/plugins/router/RoutePattern";

describe("RoutePattern", () => {
    test("pattern: ignore consecutive slashes", () => {
        const route = new RoutePattern("////action////{action}///");
        expect(route.match("/action/process")).toEqual({ action: "process" });
    });

    test("pattern: ignores edge slashes", () => {
        const route1 = new RoutePattern("/home");
        const route2 = new RoutePattern("home/");
        const route3 = new RoutePattern("/home/");
        const route4 = new RoutePattern("home");

        [route1, route2, route3, route4].forEach(route => {
            expect(route.match("/home")).toBeTruthy();
            expect(route.match("/home/")).toBeTruthy();
        });

        const route5 = new RoutePattern("/");
        const route6 = new RoutePattern("");

        [route5, route6].forEach(route => expect(route.match("/")).toBeTruthy());
    });

    test("path: ignores trailing slashes", () => {
        const route1 = new RoutePattern("/home");
        const route2 = new RoutePattern("/home/");

        [route1, route2].forEach(route => {
            expect(route.match("/home")).toBeTruthy();
            expect(route.match("/home/")).toBeTruthy();
        });
    });

    test("path: leading slashes", () => {
        const route1 = new RoutePattern("/home");
        const route2 = new RoutePattern("/home/");

        [route1, route2].forEach(route => {
            expect(route.match("home/")).toBeNull();
            expect(route.match("home")).toBeNull();
        });
    });

    test("match: empty", () => {
        const route = new RoutePattern("");
        expect(route.match("/")).toBeTruthy();
        expect(route.match("/home")).toBeNull();
    });

    test("match: /", () => {
        const route = new RoutePattern("/");
        expect(route.match("/")).toBeTruthy();
        expect(route.match("/home")).toBeNull();
    });

    test("match: /index", () => {
        const route = new RoutePattern("/index");
        expect(route.match("/index")).toBeTruthy();
        expect(route.match("/index/")).toBeTruthy();
        expect(route.match("/index1")).toBeNull();
        expect(route.match("/inde")).toBeNull();
        expect(route.match("/indexx")).toBeNull();
        expect(route.match("/index/value")).toBeNull();
    });

    test("match: /home/index", () => {
        const route = new RoutePattern("/home/index");
        expect(route.match("/home/index")).toBeTruthy();
        expect(route.match("/home/index/")).toBeTruthy();
        expect(route.match("/door/index")).toBeNull();
        expect(route.match("/index")).toBeNull();
        expect(route.match("/home/index1")).toBeNull();
        expect(route.match("/home/")).toBeNull();
    });

    test("match: /{controller}/{action}/{id}", () => {
        const route = new RoutePattern("/{controller}/{action}/{id}");
        const parameters = route.match("/products/display/10");

        expect(parameters).toBeTruthy();
        expect(parameters).toEqual({
            controller: "products",
            action: "display",
            id: "10"
        });

        expect(route.match("/home")).toBeNull();
        expect(route.match("/home/index")).toBeNull();
        expect(route.match("/controller/action/index/value")).toBeNull();
    });

    test("match: /{path*}", () => {
        const route = new RoutePattern("/{path*}");

        expect(route.match("/products/display/10")).toEqual({
            path: ["products", "display", "10"]
        });

        expect(route.match("/products/display")).toEqual({
            path: ["products", "display"]
        });

        expect(route.match("/products")).toEqual({
            path: ["products"]
        });

        expect(route.match("/")).toEqual({
            path: []
        });
    });

    test("match: /{path*:=(10)", () => {
        const route = new RoutePattern("/{path*:=(10)}");

        expect(route.match("/products/display/10")).toEqual({
            path: ["products", "display", "10"]
        });

        expect(route.match("/products/display")).toEqual({
            path: ["products", "display"]
        });

        expect(route.match("/products")).toEqual({
            path: ["products"]
        });

        expect(route.match("/")).toEqual({
            path: ["10"]
        });
    });

    test("match: /{path*:=(/controller/action/value)", () => {
        const route = new RoutePattern("/{path*:=(/controller/action/value)}");

        expect(route.match("/products/display/10")).toEqual({
            path: ["products", "display", "10"]
        });

        expect(route.match("/")).toEqual({
            path: ["controller", "action", "value"]
        });
    });

    test("match: /{path+}", () => {
        const route = new RoutePattern("/{path+}");

        expect(route.match("/products/display/10")).toEqual({
            path: ["products", "display", "10"]
        });

        expect(route.match("/products/display")).toEqual({
            path: ["products", "display"]
        });

        expect(route.match("/products")).toEqual({
            path: ["products"]
        });

        expect(route.match("/")).toBeNull();
    });

    test("match: /{id?}", () => {
        const route = new RoutePattern("/{id?}");
        expect(route.match("/")).toEqual({ id: undefined });
        expect(route.match("/10")).toEqual({ id: "10" });
    });

    test("match: /{a?}/{b?}/{c?}", () => {
        const route = new RoutePattern("/{a?}/{b?}/{c?}");
        expect(route.match("/")).toEqual({ a: undefined, b: undefined, c: undefined });
        expect(route.match("/1")).toEqual({ a: "1", b: undefined, c: undefined });
        expect(route.match("/1/2")).toEqual({ a: "1", b: "2", c: undefined });
        expect(route.match("/1/2/3")).toEqual({ a: "1", b: "2", c: "3" });
        expect(route.match("/1/2/3/4")).toBeNull();
    });

    test("match: /{a}/{b?}/{c?}", () => {
        const route = new RoutePattern("/{a}/{b?}/{c?}");
        expect(route.match("/1")).toEqual({ a: "1", b: undefined, c: undefined });
        expect(route.match("/1/2")).toEqual({ a: "1", b: "2", c: undefined });
        expect(route.match("/1/2/3")).toEqual({ a: "1", b: "2", c: "3" });

        expect(route.match("/")).toBeNull();
        expect(route.match("/1/2/3/4")).toBeNull();
    });

    test("match: /{a?}/{b}/{c?}", () => {
        const route = new RoutePattern("/{a?}/{b}/{c?}");
        expect(route.match("/2")).toEqual({ a: undefined, b: "2", c: undefined });
        expect(route.match("/1/2")).toEqual({ a: "1", b: "2", c: undefined });
        expect(route.match("/1/2/3")).toEqual({ a: "1", b: "2", c: "3" });

        expect(route.match("/")).toBeNull();
        expect(route.match("/1/2/3/4")).toBeNull();
    });

    test("match: /a/{a}/b/{b}/c/{c}", () => {
        const route = new RoutePattern("/a/{a}/b/{b}/c/{c}");
        expect(route.match("/a/1/b/2/c/3")).toEqual({ a: "1", b: "2", c: "3" });

        expect(route.match("/x/1/b/c/3")).toBeNull();
        expect(route.match("/a/b/c")).toBeNull();
        expect(route.match("/a/1/b/2/c")).toBeNull();
        expect(route.match("/a/1/b/c/3")).toBeNull();
    });

    test("match: /a={a}/b={b}/c={c}", () => {
        const route = new RoutePattern("/a={a}/b={b}/c={c}");
        expect(route.match("/a=1/b=2/c=3")).toEqual({ a: "1", b: "2", c: "3" });

        expect(route.match("/a=1/b=/c=3")).toBeNull();
        expect(route.match("/a=1/c=3")).toBeNull();
        expect(route.match("/a=/b=2/c=3")).toBeNull();
        expect(route.match("/b=2/c=3")).toBeNull();
        expect(route.match("/a=1/b=2")).toBeNull();
    });

    test("match: /a={a}_b={b}_c={c}", () => {
        const route = new RoutePattern("/a={a}_b={b}_c={c}");
        expect(route.match("/a=1_b=2_c=3")).toEqual({ a: "1", b: "2", c: "3" });

        expect(route.match("/a=1_b=_c=3")).toBeNull();
        expect(route.match("/a=1_c=3")).toBeNull();
        expect(route.match("/a=_b=2_c=3")).toBeNull();
        expect(route.match("/b=2_c=3")).toBeNull();
        expect(route.match("/a=1_b=2")).toBeNull();
    });

    test("match: /a={a?}_b={b?}_c={c?}", () => {
        const route = new RoutePattern("/a={a?}_b={b?}_c={c?}");
        expect(route.match("/a=_b=_c=")).toEqual({ a: undefined, b: undefined, c: undefined });
        expect(route.match("/a=_b=2_c=")).toEqual({ a: undefined, b: "2", c: undefined });
        expect(route.match("/a=_b=2_c=3")).toEqual({ a: undefined, b: "2", c: "3" });
        expect(route.match("/a=1_b=2_c=")).toEqual({ a: "1", b: "2", c: undefined });

        expect(route.match("/a=1_c=3")).toBeNull();
        expect(route.match("/b=2_c=3")).toBeNull();
        expect(route.match("/a=1_b=2")).toBeNull();
    });

    test("match: /action/{id?}", () => {
        const route = new RoutePattern("/action/{id?}");

        expect(route.match("/action")).toEqual({ id: undefined });
        expect(route.match("/action/1")).toEqual({ id: "1" });
    });

    test("default parameter: /{id?:=(10)}", () => {
        const route = new RoutePattern("/{id?:=(10)}");

        expect(route.match("/")).toEqual({ id: "10" });
        expect(route.match("/20")).toEqual({ id: "20" });

        expect(route.match("/10/20")).toBeNull();
    });

    test("default parameter: /{id*:=(10)}", () => {
        const route = new RoutePattern("/{id*:=(10)}");

        expect(route.match("/")).toEqual({ id: ["10"] });
        expect(route.match("/20")).toEqual({ id: ["20"] });
        expect(route.match("/10/20")).toEqual({ id: ["10", "20"] });
    });

    test("default parameter: /{id*:default(10)}", () => {
        const route = new RoutePattern("/{id*:=(10)}");

        expect(route.match("/")).toEqual({ id: ["10"] });
        expect(route.match("/20")).toEqual({ id: ["20"] });
        expect(route.match("/10/20")).toEqual({ id: ["10", "20"] });
    });

    test("default parameter: /{id*:=()}", () => {
        const route = new RoutePattern("/{id*:=()}");

        expect(route.match("/")).toEqual({ id: [] });
        expect(route.match("/20")).toEqual({ id: ["20"] });
        expect(route.match("/10/20")).toEqual({ id: ["10", "20"] });
    });

    test("constraint: /{id:(\\d+)}", () => {
        const route = new RoutePattern("/{id:(\\d+)}");

        expect(route.match("/1000")).toEqual({ id: "1000" });
        expect(route.match("/home")).toBeNull();
    });

    test("constraint: /{id:(\\d+):int:min(1000):max(1002)}", () => {
        const route = new RoutePattern("/{id:(\\d+):int:min(1000):max(1002)}");

        expect(route.match("/1000")).toEqual({ id: 1000 });
        expect(route.match("/1001")).toEqual({ id: 1001 });
        expect(route.match("/1002")).toEqual({ id: 1002 });

        expect(route.match("/1003")).toBeNull();
        expect(route.match("/999")).toBeNull();
        expect(route.match("/home")).toBeNull();
    });

    test("constraint: /{path*:(\\d+):int:range(100,102):=(100)}", () => {
        const route = new RoutePattern("/{path*:(\\d+):int:range(100,102):=(100)}");

        expect(route.match("/")).toEqual({ path: [100] });
        expect(route.match("/100")).toEqual({ path: [100] });
        expect(route.match("/100/101/102")).toEqual({ path: [100, 101, 102] });

        expect(route.match("/103")).toBeNull();
        expect(route.match("/103/104")).toBeNull();
        expect(route.match("/103/104")).toBeNull();
        expect(route.match("/100/101/103")).toBeNull();
        expect(route.match("/home")).toBeNull();
    });

    test("constraint: /{path*:int:range(100,105):=(106)}", () => {
        const route = new RoutePattern("/{path*:int:range(100,105):=(106)}");

        expect(route.match("/")).toBeNull();
        expect(route.match("/100/102/106")).toBeNull();
    });

    test("constraint: /{id?:=({})}", () => {
        const route = new RoutePattern("/{id?:=({default{}})}");
        expect(route.match("/")).toEqual({ id: "{default{}}" });
    });

    test("constraint(bool): /{id:bool", () => {
        const route = new RoutePattern("/{id:bool}");
        expect(route.match("/true")).toEqual({ id: true });
        expect(route.match("/True")).toEqual({ id: true });
        expect(route.match("/false")).toEqual({ id: false });
        expect(route.match("/False")).toEqual({ id: false });

        expect(route.match("/1")).toBeNull();
    });

    test("constraint: /{id:number", () => {
        const route = new RoutePattern("/{id:number}");
        expect(route.match("/156004")).toEqual({ id: 156004 });
        expect(route.match("/0.156")).toEqual({ id: 0.156 });
        expect(route.match("/1E+100")).toEqual({ id: 1E100 });
        expect(route.match("/-10E-10")).toEqual({ id: -10E-10 });

        expect(route.match("/3,14")).toBeNull();
    });

    test("constraint: /{id:alpha", () => {
        const route = new RoutePattern("/{id:alpha}");
        expect(route.match("/value")).toEqual({ id: "value" });

        expect(route.match("/a.b")).toBeNull();
        expect(route.match("/a-b")).toBeNull();
        expect(route.match("/a_b")).toBeNull();
        expect(route.match("/a1")).toBeNull();
    });

    test("constraint: /{id:length(3)", () => {
        const route = new RoutePattern("/{id:length(3)}");
        expect(route.match("/abc")).toEqual({ id: "abc" });

        expect(route.match("/ab")).toBeNull();
        expect(route.match("/abcd")).toBeNull();
    });

    test("constraint: /{id:minlength(3)", () => {
        const route = new RoutePattern("/{id:minlength(3)}");
        expect(route.match("/abc")).toEqual({ id: "abc" });
        expect(route.match("/abcd")).toEqual({ id: "abcd" });

        expect(route.match("/ab")).toBeNull();
    });

    test("constraint: /{id:maxlength(3)", () => {
        const route = new RoutePattern("/{id:maxlength(3)}");
        expect(route.match("/abc")).toEqual({ id: "abc" });
        expect(route.match("/ab")).toEqual({ id: "ab" });

        expect(route.match("/abcd")).toBeNull();
    });

    test("constraint: /{id:minlength(3):maxlength(5)}", () => {
        const route = new RoutePattern("/{id:minlength(3):maxlength(5)}");
        expect(route.match("/abc")).toEqual({ id: "abc" });
        expect(route.match("/abcd")).toEqual({ id: "abcd" });
        expect(route.match("/abcde")).toEqual({ id: "abcde" });

        expect(route.match("/a")).toBeNull();
        expect(route.match("/ab")).toBeNull();
        expect(route.match("/abcdef")).toBeNull();
    });

    test("error: unclosed brace parameter", () => {
        assert.throws(() => new RoutePattern("/{id"), "Invalid pattern: /{id");
        assert.throws(() => new RoutePattern("/{id}/{"), "Invalid pattern: /{");
        assert.throws(() => new RoutePattern("/{id:=({)}"), "Invalid pattern: /{id:=({)}");
    });

    test("error: missing parameter name", () => {
        assert.throws(() => new RoutePattern("/{}"), "Invalid parameter name: /{}");
        assert.throws(() => new RoutePattern("/{:=(1)}"), "Invalid parameter name: /{:=(1)}");
    });

    test("error: invalid constraint", () => {
        assert.throws(() => new RoutePattern("/{id:}"), "Invalid pattern: /{id:}");
        assert.throws(() => new RoutePattern("/{id::}"), "Invalid pattern: /{id::}");
        assert.throws(() => new RoutePattern("/{id: int:}"), "Invalid constraint name: /{id: int:}");
        assert.throws(() => new RoutePattern("/{id:int }"), "Invalid constraint name: /{id:int }");
        assert.throws(() => new RoutePattern("/{id:(\\d+) }"), "Invalid pattern: /{id:(\\d+) }");
        assert.throws(() => new RoutePattern("/{id: : }"), "Invalid constraint name: /{id: : }");
        assert.throws(() => new RoutePattern("/{id :()}"), "Invalid parameter name: /{id :()}");
        assert.throws(() => new RoutePattern("/{id :([a-z])}"), "Invalid parameter name: /{id :([a-z])}");
    });

    test("error: using all segment parameters as optional is not permitted", () => {
        assert.throws(() => new RoutePattern("/{a?}{b?}"), "Using all segment parameters as optional is not permitted: /{a?}{b?}");
        assert.throws(() => new RoutePattern("/{a?}{b?}{c?}"), "Using all segment parameters as optional is not permitted: /{a?}{b?}{c?}");
        assert.throws(() => new RoutePattern("/{a*}{b*}"), "Using all segment parameters as optional is not permitted: /{a*}{b*}");
        assert.throws(() => new RoutePattern("/{a?}{b*}"), "Using all segment parameters as optional is not permitted: /{a?}{b*}");
    });

    test("error: catch-all parameter can only appear as the last segment", () => {
        assert.throws(() => new RoutePattern("/{a*}/{b}"), "A catch-all parameter can only appear as the last segment: /{a*}/{b}");
        assert.throws(() => new RoutePattern("/{a}/{b*}/c"), "A catch-all parameter can only appear as the last segment: /{a}/{b*}/c");
        assert.throws(() => new RoutePattern("/{a+}{b+}"), "A catch-all parameter can only appear as the last segment: /{a+}{b+}");
        assert.throws(() => new RoutePattern("/{a}/{b*}/{c}"), "A catch-all parameter can only appear as the last segment: /{a}/{b*}/{c}");
        assert.throws(() => new RoutePattern("/{a*}-b"), "A catch-all parameter can only appear as the last segment: /{a*}-b");
        assert.throws(() => new RoutePattern("/a-{b*}-c"), "A catch-all parameter can only appear as the last segment: /a-{b*}-c");
        assert.throws(() => new RoutePattern("/{a?}{b*}{c+}"), "A catch-all parameter can only appear as the last segment: /{a?}{b*}{c+}");
        assert.throws(() => new RoutePattern("/{b*}{c+}"), "A catch-all parameter can only appear as the last segment: /{b*}{c+}");
        assert.throws(() => new RoutePattern("/{a?}{b+}{c+}"), "A catch-all parameter can only appear as the last segment: /{a?}{b+}{c+}");
        assert.throws(() => new RoutePattern("/{a+}{b+}{c+}"), "A catch-all parameter can only appear as the last segment: /{a+}{b+}{c+}");
    });

    test("error: unknown constraint", () => {
        assert.throws(() => new RoutePattern("/{a:uuid}"), "Unknown constraint 'uuid'");
    });

    test("error: literal segments cannot contain the '?' character", () => {
        assert.throws(() => new RoutePattern("/action?"), "Literal segments cannot contain the '?' character: /action?");
        assert.throws(() => new RoutePattern("/?action"), "Literal segments cannot contain the '?' character: /?action");
        assert.throws(() => new RoutePattern("/name?action"), "Literal segments cannot contain the '?' character: /name?action");
        assert.throws(() => new RoutePattern("/action/{name}?)"), "Literal segments cannot contain the '?' character: /action/{name}?");
        assert.throws(() => new RoutePattern("/action/?{name})"), "Literal segments cannot contain the '?' character: /action/?{name}");
    });

    test("error: repeated parameters", () => {
        assert.throws(() => new RoutePattern("/{a}/{a}"), "The route parameter name 'a' appears more than one time");
        assert.throws(() => new RoutePattern("/{a}{a}"), "The route parameter name 'a' appears more than one time");
        assert.throws(() => new RoutePattern("/{a}-{a}"), "The route parameter name 'a' appears more than one time");
        assert.throws(() => new RoutePattern("/{a}/b/{a}"), "The route parameter name 'a' appears more than one time");
    });
});
