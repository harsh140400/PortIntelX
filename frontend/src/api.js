const BASE_URL = "http://127.0.0.1:8000";

function getToken() {
    return localStorage.getItem("token") || "";
}

export async function apiGet(path) {
    try {
        const res = await fetch(`${BASE_URL}${path}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${getToken()}`,
            },
        });

        const data = await res.json();
        return data;
    } catch (err) {
        return { success: false, detail: "GET request failed" };
    }
}

export async function apiPost(path, body) {
    try {
        const res = await fetch(`${BASE_URL}${path}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getToken()}`,
            },
            body: JSON.stringify(body),
        });

        const data = await res.json();
        return data;
    } catch (err) {
        return { success: false, detail: "POST request failed" };
    }
}

export async function apiDelete(path) {
    try {
        const res = await fetch(`${BASE_URL}${path}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${getToken()}`,
            },
        });

        const data = await res.json();
        return data;
    } catch (err) {
        return { success: false, detail: "DELETE request failed" };
    }
}