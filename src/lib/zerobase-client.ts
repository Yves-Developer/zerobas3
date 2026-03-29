import { authClient } from "./auth-client";

type FetchOptions = RequestInit & {
  params?: Record<string, string>;
};

class ZeroBaseTable<T = any> {
  constructor(
    private tableName: string,
    private url: string,
    private key: string
  ) {}

  async select(columns: string = "*") {
    const res = await fetch(`${this.url}/api/db/${this.tableName}?select=${columns}`, {
      headers: {
        "apikey": this.key,
        "Authorization": `Bearer ${this.key}`,
      },
    });
    if (!res.ok) throw new Error(await res.text());
    const result = await res.json();
    return { data: result.data as T[], error: null };
  }

  async insert(data: Partial<T> | Partial<T>[]) {
    const res = await fetch(`${this.url}/api/db/${this.tableName}`, {
      method: "POST",
      headers: {
        "apikey": this.key,
        "Authorization": `Bearer ${this.key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return { data: await res.json() as T[], error: null };
  }

  async update(id: any, updates: Partial<T>) {
    const res = await fetch(`${this.url}/api/db/${this.tableName}`, {
      method: "PUT",
      headers: {
        "apikey": this.key,
        "Authorization": `Bearer ${this.key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, updates }),
    });
    if (!res.ok) throw new Error(await res.text());
    return { data: await res.json() as T[], error: null };
  }

  async delete(id: any) {
    const res = await fetch(`${this.url}/api/db/${this.tableName}`, {
      method: "DELETE",
      headers: {
        "apikey": this.key,
        "Authorization": `Bearer ${this.key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) throw new Error(await res.text());
    return { data: await res.json() as T[], error: null };
  }
}

class ZeroBaseAuth {
    constructor(private url: string, private key: string) {}

    async signInWithGoogle() {
        return await authClient.signIn.social({
            provider: "google",
            callbackURL: window.location.origin + "/dashboard"
        });
    }

    async signOut() {
        return await authClient.signOut();
    }

    async getUser() {
        return await authClient.getSession();
    }
}

class ZeroBaseStorage {
    constructor(private url: string, private key: string) {}

    from(bucketName: string) {
        return {
            upload: async (path: string, file: File) => {
                const formData = new FormData();
                formData.append("file", file);
                const res = await fetch(`${this.url}/api/storage/v1/object/${bucketName}/${path}`, {
                    method: "POST",
                    headers: {
                        "apikey": this.key,
                        "Authorization": `Bearer ${this.key}`,
                    },
                    body: formData
                });
                return { data: await res.json(), error: null };
            },
            getPublicUrl: (path: string) => {
                return { publicUrl: `${this.url}/api/storage/v1/object/${bucketName}/${path}` };
            }
        };
    }
}

export class ZeroBaseClient {
  auth: ZeroBaseAuth;
  storage: ZeroBaseStorage;

  constructor(private url: string, private key: string) {
    this.auth = new ZeroBaseAuth(url, key);
    this.storage = new ZeroBaseStorage(url, key);
  }

  from<T = any>(table: string) {
    return new ZeroBaseTable<T>(table, this.url, this.key);
  }
}

export const createClient = (url: string, key: string) => {
  return new ZeroBaseClient(url, key);
};
