import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { lerToken } from "@/lib/auth";
import { Cadastro } from "@/pages/Cadastro";
import { Dashboard } from "@/pages/Dashboard";
import { DetalhesDemanda } from "@/pages/DetalhesDemanda";
import { Login } from "@/pages/Login";
import { RecuperarSenha } from "@/pages/RecuperarSenha";

function LayoutGlobal() {
  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <Navbar />
      <Outlet />
    </div>
  );
}

function RotaProtegida() {
  if (!lerToken()) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<LayoutGlobal />}>
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/recuperar-senha" element={<RecuperarSenha />} />
        <Route path="/esqueci-senha" element={<Navigate to="/recuperar-senha" replace />} />
        <Route element={<RotaProtegida />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/demandas/:id" element={<DetalhesDemanda />} />
          <Route path="/demanda/:id" element={<DetalhesDemanda />} />
          <Route path="/demanda" element={<DetalhesDemanda />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
