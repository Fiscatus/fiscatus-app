import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex bg-slate-50">
      <div className="flex-1 flex flex-col min-h-screen ml-64">
        <button onClick={() => navigate("/planejamento-da-contratacao")} className="bg-blue-600 text-white px-4 py-2 rounded mt-8 w-fit">Ir para Planejamento da Contratação</button>
      </div>
    </div>
  );
} 