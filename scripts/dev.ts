const api = Bun.spawn(["bun", "--watch", "src/server.ts"], {
  stdout: "inherit",
  stderr: "inherit",
  env: process.env,
});

const web = Bun.spawn(["bun", "run", "dev"], {
  cwd: "frontend",
  stdout: "inherit",
  stderr: "inherit",
  env: process.env,
});

function parar() {
  api.kill();
  web.kill();
}

process.on("SIGINT", parar);
process.on("SIGTERM", parar);

await Promise.all([api.exited, web.exited]);
