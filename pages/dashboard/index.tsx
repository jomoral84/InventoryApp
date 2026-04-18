import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Layout from "@/components/layout/Layout";
import EditItemModal from "@/components/forms/EditItemModal";
import FormMovil from "@/components/forms/FormMovil";
import FormAlcoholimetro from "@/components/forms/FormAlcoholimetro";
import FormPdaCelular from "@/components/forms/FormPdaCelular";
import FormInformatica from "@/components/forms/FormInformatica";
import { useAuth } from "@/lib/AuthContext";
import { exportToPDF } from "@/lib/exportPdf";

const TABS = [
  { key: "movil", label: "Móviles", icon: "🚗" },
  { key: "alcoholimetro", label: "Alcoholímetros", icon: "🔬" },
  { key: "pda_celular", label: "PDA/Celulares", icon: "📱" },
  { key: "informatica", label: "Informática", icon: "💻" },
];

function estadoBadge(estado: string) {
  const map: Record<string, string> = {
    Operativo: "bg-green-100 text-green-700",
    Funciona: "bg-green-100 text-green-700",
    "No Operativo": "bg-red-100 text-red-700",
    "No funciona": "bg-red-100 text-red-700",
    "A reparar": "bg-orange-100 text-orange-700",
    "A calibrar": "bg-yellow-100 text-yellow-700",
    Trizada: "bg-orange-100 text-orange-700",
    "Sin chip": "bg-gray-100 text-gray-600",
    "Requiere Mantenimiento": "bg-yellow-100 text-yellow-700",
    "Falta Toner": "bg-purple-100 text-purple-700",
  };
  return map[estado] || "bg-blue-100 text-blue-700";
}

function TH({ children }: { children: React.ReactNode }) {
  return (
    <th className="text-left text-xs font-semibold text-blue-400 uppercase tracking-wider px-4 py-3 whitespace-nowrap">
      {children}
    </th>
  );
}
function TD({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td className={`px-4 py-3 text-sm text-blue-800 ${className}`}>
      {children}
    </td>
  );
}

export default function DashboardPage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("movil");
  const [allItems, setAllItems] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [imgModal, setImgModal] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<any | null>(null);
  const [filterDelegacion, setFilterDelegacion] = useState("");
  const [showNewForm, setShowNewForm] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const fetchItems = useCallback(async () => {
    if (!token) return;
    setFetching(true);
    const res = await fetch("/api/items", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setAllItems(Array.isArray(data) ? data : []);
    setFetching(false);
  }, [token]);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
      return;
    }
    if (!loading && user?.role !== "admin") {
      router.replace("/inventario");
      return;
    }
    fetchItems();
  }, [user, loading]);

  if (loading || !user) return null;

  const items = allItems.filter(
    (i) =>
      i.tipo === activeTab &&
      (!filterDelegacion || i.delegacion === filterDelegacion),
  );
  const delegaciones = Array.from(
    new Set(allItems.map((i: any) => i.delegacion)),
  ).sort() as string[];
  const counts = TABS.reduce(
    (acc, t) => ({
      ...acc,
      [t.key]: allItems.filter((i: any) => i.tipo === t.key).length,
    }),
    {} as Record<string, number>,
  );

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este elemento?")) return;
    await fetch(`/api/items?id=${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchItems();
  };

  const handleSaved = () => {
    setEditItem(null);
    setShowNewForm(false);
    fetchItems();
    setSuccessMsg("¡Elemento guardado correctamente!");
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  return (
    <>
      <Head>
        <title>Dashboard — Inventario</title>
      </Head>
      <Layout title="Dashboard">
        {successMsg && (
          <div className="mb-5 bg-green-50 border border-green-200 text-green-700 px-5 py-3 rounded-xl text-sm font-medium flex items-center gap-2 fade-in">
            <span>✓</span> {successMsg}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {TABS.map((t) => (
            <div
              key={t.key}
              className="bg-white rounded-xl border border-blue-100 p-4 flex items-center gap-3"
            >
              <span className="text-2xl">{t.icon}</span>
              <div>
                <p className="text-2xl font-bold text-blue-900">
                  {counts[t.key] || 0}
                </p>
                <p className="text-xs text-blue-400">{t.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-blue-100 overflow-hidden shadow-sm">
          {/* Tab bar */}
          <div className="flex border-b border-blue-100 bg-blue-50/40">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  setShowNewForm(false);
                }}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-all relative border-r border-blue-100/50 last:border-r-0 ${
                  activeTab === tab.key
                    ? "text-blue-700 bg-white tab-active"
                    : "text-blue-400 hover:text-blue-600"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                <span
                  className={`ml-1 text-xs px-1.5 py-0.5 rounded-full font-medium ${activeTab === tab.key ? "bg-blue-100 text-blue-700" : "bg-blue-100/50 text-blue-400"}`}
                >
                  {counts[tab.key] || 0}
                </span>
              </button>
            ))}
            {/* Controles de la derecha */}
            <div className="ml-auto flex items-center gap-2 px-4">
              <select
                value={filterDelegacion}
                onChange={(e) => setFilterDelegacion(e.target.value)}
                className="text-xs border border-blue-200 rounded-lg px-3 py-1.5 text-blue-700 bg-white focus:outline-none"
              >
                <option value="">Todas las delegaciones</option>
                {delegaciones.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              {/* Botón exportar PDF */}
              <button
                onClick={() => {
                  const date = new Date().toLocaleDateString("es-AR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  });
                  exportToPDF(allItems, filterDelegacion, date);
                }}
                title="Exportar a PDF"
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:border-red-300 transition-all font-semibold whitespace-nowrap"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Exportar PDF
              </button>
              <button
                onClick={() => setShowNewForm((v) => !v)}
                className="btn-primary text-xs px-4 py-1.5 whitespace-nowrap"
              >
                {showNewForm ? "✕ Cancelar" : "+ Nuevo elemento"}
              </button>
            </div>
          </div>

          {/* Formulario de nuevo elemento (admin) */}
          {showNewForm && (
            <div className="border-b border-blue-100 bg-blue-50/30 px-6 py-5 fade-in">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-lg">
                  {TABS.find((t) => t.key === activeTab)?.icon}
                </div>
                <h3 className="font-bold text-blue-900">
                  Nuevo {TABS.find((t) => t.key === activeTab)?.label}
                </h3>
              </div>
              <div className="max-w-2xl">
                {activeTab === "movil" && <FormMovil onSuccess={handleSaved} />}
                {activeTab === "alcoholimetro" && (
                  <FormAlcoholimetro onSuccess={handleSaved} />
                )}
                {activeTab === "pda_celular" && (
                  <FormPdaCelular onSuccess={handleSaved} />
                )}
                {activeTab === "informatica" && (
                  <FormInformatica onSuccess={handleSaved} />
                )}
              </div>
            </div>
          )}

          {/* Tabla */}
          <div className="overflow-x-auto">
            {fetching ? (
              <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-16 text-blue-300">
                <div className="text-4xl mb-3">
                  {TABS.find((t) => t.key === activeTab)?.icon}
                </div>
                <p className="text-sm font-medium">
                  Sin registros en esta categoría
                </p>
              </div>
            ) : activeTab === "movil" ? (
              <MovilTable
                items={items}
                onDelete={handleDelete}
                onImg={setImgModal}
                onEdit={setEditItem}
              />
            ) : activeTab === "alcoholimetro" ? (
              <AlcoholimetroTable
                items={items}
                onDelete={handleDelete}
                onEdit={setEditItem}
              />
            ) : activeTab === "pda_celular" ? (
              <PdaTable
                items={items}
                onDelete={handleDelete}
                onEdit={setEditItem}
              />
            ) : (
              <InformaticaTable
                items={items}
                onDelete={handleDelete}
                onEdit={setEditItem}
              />
            )}
          </div>
        </div>

        {imgModal && (
          <div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
            onClick={() => setImgModal(null)}
          >
            <img
              src={imgModal}
              className="max-w-[90vw] max-h-[90vh] rounded-2xl"
            />
          </div>
        )}

        {editItem && (
          <EditItemModal
            item={editItem}
            onClose={() => setEditItem(null)}
            onSaved={handleSaved}
            isAdmin={true}
          />
        )}
      </Layout>
    </>
  );
}

function ActionButtons({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <TD>
      <div className="flex gap-1">
        <button
          onClick={onEdit}
          title="Editar"
          className="w-7 h-7 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-500 hover:text-blue-700 flex items-center justify-center transition-colors text-xs"
        >
          ✎
        </button>
        <button
          onClick={onDelete}
          title="Eliminar"
          className="w-7 h-7 rounded-md bg-red-50 hover:bg-red-100 text-red-400 hover:text-red-600 flex items-center justify-center transition-colors text-xs"
        >
          ✕
        </button>
      </div>
    </TD>
  );
}

function MovilTable({ items, onDelete, onImg, onEdit }: any) {
  return (
    <table className="w-full">
      <thead className="bg-blue-50/70 border-b border-blue-100">
        <tr>
          <TH>Delegación</TH>
          <TH>Usuario</TH>
          <TH>Dominio</TH>
          <TH>Marca/Modelo</TH>
          <TH>Año</TH>
          <TH>Km</TH>
          <TH>Estado</TH>
          <TH>Mat.</TH>
          <TH>RTO</TH>
          <TH>Observaciones</TH>
          <TH>Foto</TH>
          <TH>Fecha</TH>
          <TH>Acciones</TH>
        </tr>
      </thead>
      <tbody className="divide-y divide-blue-50">
        {items.map((i: any) => (
          <tr key={i.id} className="hover:bg-blue-50/30 transition-colors">
            <TD>
              <span className="font-medium">{i.delegacion}</span>
            </TD>
            <TD className="text-blue-500">{i.username}</TD>
            <TD>
              <span className="font-mono text-blue-700 font-semibold">
                {i.dominio}
              </span>
            </TD>
            <TD>
              {i.marca} {i.modelo}
            </TD>
            <TD>{i.anio}</TD>
            <TD>{i.kilometros}</TD>
            <TD>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${estadoBadge(i.estado)}`}
              >
                {i.estado}
              </span>
            </TD>
            <TD>
              <span
                className={
                  i.matafuegos === "Si" ? "text-green-600" : "text-red-500"
                }
              >
                {i.matafuegos}
              </span>
            </TD>
            <TD>
              <span
                className={i.rto === "Si" ? "text-green-600" : "text-red-500"}
              >
                {i.rto}
              </span>
            </TD>
            <TD className="max-w-[120px] truncate text-blue-400 text-xs">
              {i.observaciones || "—"}
            </TD>
            <TD>
              {i.fotoUrl ? (
                <button
                  onClick={() => onImg(i.fotoUrl)}
                  className="text-blue-500 hover:text-blue-700 text-xs underline"
                >
                  Ver foto
                </button>
              ) : (
                "—"
              )}
            </TD>
            <TD className="text-blue-400 text-xs">
              {new Date(i.createdAt).toLocaleDateString("es-AR")}
            </TD>
            <ActionButtons
              onEdit={() => onEdit(i)}
              onDelete={() => onDelete(i.id)}
            />
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function AlcoholimetroTable({ items, onDelete, onEdit }: any) {
  return (
    <table className="w-full">
      <thead className="bg-blue-50/70 border-b border-blue-100">
        <tr>
          <TH>Delegación</TH>
          <TH>Usuario</TH>
          <TH>N° Serie</TH>
          <TH>Estado</TH>
          <TH>Vencimiento</TH>
          <TH>Observaciones</TH>
          <TH>Fecha carga</TH>
          <TH>Acciones</TH>
        </tr>
      </thead>
      <tbody className="divide-y divide-blue-50">
        {items.map((i: any) => (
          <tr key={i.id} className="hover:bg-blue-50/30">
            <TD>
              <span className="font-medium">{i.delegacion}</span>
            </TD>
            <TD className="text-blue-500">{i.username}</TD>
            <TD>
              <span className="font-mono text-blue-700">{i.nroSerie}</span>
            </TD>
            <TD>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${estadoBadge(i.estado)}`}
              >
                {i.estado}
              </span>
            </TD>
            <TD>{i.fechaVencimiento || "—"}</TD>
            <TD className="max-w-[160px] truncate text-blue-400 text-xs">
              {i.observaciones || "—"}
            </TD>
            <TD className="text-blue-400 text-xs">
              {new Date(i.createdAt).toLocaleDateString("es-AR")}
            </TD>
            <ActionButtons
              onEdit={() => onEdit(i)}
              onDelete={() => onDelete(i.id)}
            />
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function PdaTable({ items, onDelete, onEdit }: any) {
  return (
    <table className="w-full">
      <thead className="bg-blue-50/70 border-b border-blue-100">
        <tr>
          <TH>Delegación</TH>
          <TH>Usuario</TH>
          <TH>Estado</TH>
          <TH>Marca/Modelo</TH>
          <TH>N° Sistemas</TH>
          <TH>N° Línea</TH>
          <TH>Empresa</TH>
          <TH>Asignada a</TH>
          <TH>Obs.</TH>
          <TH>Fecha</TH>
          <TH>Acciones</TH>
        </tr>
      </thead>
      <tbody className="divide-y divide-blue-50">
        {items.map((i: any) => (
          <tr key={i.id} className="hover:bg-blue-50/30">
            <TD>
              <span className="font-medium">{i.delegacion}</span>
            </TD>
            <TD className="text-blue-500">{i.username}</TD>
            <TD>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${estadoBadge(i.estado)}`}
              >
                {i.estado}
              </span>
            </TD>
            <TD>
              {i.marca} {i.modelo}
            </TD>
            <TD className="font-mono text-xs">{i.nroSistemas || "—"}</TD>
            <TD>{i.nroLinea || "—"}</TD>
            <TD>{i.empresa}</TD>
            <TD>{i.asignadaA || "—"}</TD>
            <TD className="max-w-[100px] truncate text-blue-400 text-xs">
              {i.observaciones || "—"}
            </TD>
            <TD className="text-blue-400 text-xs">
              {new Date(i.createdAt).toLocaleDateString("es-AR")}
            </TD>
            <ActionButtons
              onEdit={() => onEdit(i)}
              onDelete={() => onDelete(i.id)}
            />
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function InformaticaTable({ items, onDelete, onEdit }: any) {
  return (
    <table className="w-full">
      <thead className="bg-blue-50/70 border-b border-blue-100">
        <tr>
          <TH>Delegación</TH>
          <TH>Usuario</TH>
          <TH>Dispositivo</TH>
          <TH>Estado</TH>
          <TH>Marca/Modelo</TH>
          <TH>N° Sistemas</TH>
          <TH>Observaciones</TH>
          <TH>Fecha</TH>
          <TH>Acciones</TH>
        </tr>
      </thead>
      <tbody className="divide-y divide-blue-50">
        {items.map((i: any) => (
          <tr key={i.id} className="hover:bg-blue-50/30">
            <TD>
              <span className="font-medium">{i.delegacion}</span>
            </TD>
            <TD className="text-blue-500">{i.username}</TD>
            <TD>
              <span className="font-semibold text-blue-700">
                {i.dispositivo}
              </span>
            </TD>
            <TD>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${estadoBadge(i.estado)}`}
              >
                {i.estado}
              </span>
            </TD>
            <TD>
              {i.marca} {i.modelo}
            </TD>
            <TD className="font-mono text-xs">{i.nroSistemas || "—"}</TD>
            <TD className="max-w-[140px] truncate text-blue-400 text-xs">
              {i.observaciones || "—"}
            </TD>
            <TD className="text-blue-400 text-xs">
              {new Date(i.createdAt).toLocaleDateString("es-AR")}
            </TD>
            <ActionButtons
              onEdit={() => onEdit(i)}
              onDelete={() => onDelete(i.id)}
            />
          </tr>
        ))}
      </tbody>
    </table>
  );
}
