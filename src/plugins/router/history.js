import { use_location } from "@/utilities/use_location";
import { warn } from "@/utilities/utils";

let location;

const hash_api = {
    get path() {
        return location.hash.slice(1) || "/";
    },
    get "location"() {
        return location;
    },
    resolve(path) {
        let url = new URL(path);
        return url.hash ? url.hash.slice(1) || "/" : url.pathname;
    },
    navigate(path, replace = false) {
        path.indexOf("#") < 0 && (path = "#" + path);
        navigate(path, replace);
    }
};

const html5_api = {
    get path() {
        return location.pathname;
    },
    get "location"() {
        return location;
    },
    resolve(path) {
        return new URL(path).pathname;
    },
    navigate(path, replace = false) {
        navigate(path, replace);
    }
};

function navigate(path, replace) {
    history[replace ? "replaceState" : "pushState"]({}, "", path);
    location.refresh();
}

const known_api = {
    html5: html5_api,
    hash: hash_api
};

export function create_history(name) {
    location ??= use_location();

    name ||= "html5";
    let api = known_api[name];

    if (!api) {
        warn(`Unknown history API: ${ name }`);
        api = html5_api;
    }

    return api;
}
