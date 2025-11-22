const transpiler = new Bun.Transpiler({ loader: "ts"})

const server = Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);

    if (url.pathname.endsWith(".ts")) {
      const filePath = `./public${url.pathname}`;
      const file = Bun.file(filePath);

      if (await file.exists()) {
        const tsCode = await file.text();

        const jsCode = transpiler.transformSync(tsCode);

        return new Response(jsCode, {
          headers: { "Content-Type": "application/javascript" },
        });
      }
    }

    let path = url.pathname === "/" ? "/index.html" : url.pathname;
    const file = Bun.file(`./public${path}`);

    if (await file.exists()) {
      return new Response(file);
    }

    return new Response("halaman tidak ditemukan", { status: 404 });
  },
});

console.log(`Server berjalan di http://localhost:${server.port}`);
