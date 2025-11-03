"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Inter } from "next/font/google";
import { Folder, FileText, ArrowLeft, Plus, Trash2, Save } from "lucide-react";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"] });

interface ItemForm {
  accountCode: string;
  description: string;
  baseTotal: string;
  vatType: number;
  irpfPercent: string;
}

export default function NewPOPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [formData, setFormData] = useState({
    supplier: "",
    department: "",
    type: "Servicios" as "Servicios" | "Bienes",
    description: "",
    requiresHod: false,
  });

  const [items, setItems] = useState<ItemForm[]>([
    {
      accountCode: "",
      description: "",
      baseTotal: "",
      vatType: 21,
      irpfPercent: "0",
    },
  ]);

  const [saving, setSaving] = useState(false);

  const departments = [
    "Arte",
    "Producción",
    "Fotografía",
    "Sonido",
    "Vestuario",
  ];

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        accountCode: "",
        description: "",
        baseTotal: "",
        vatType: 21,
        irpfPercent: "0",
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) {
      alert("Debe haber al menos un ítem en la PO");
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (
    index: number,
    field: keyof ItemForm,
    value: string | number
  ) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const calculateItemTotals = (
    baseTotal: number,
    vatType: number,
    irpfPercent: number
  ) => {
    const iva = (baseTotal * vatType) / 100;
    const irpf = (baseTotal * irpfPercent) / 100;
    const total = baseTotal + iva - irpf;
    return { base: baseTotal, iva, irpf, total };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-ES", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const calculateTotals = () => {
    return items.reduce(
      (acc, item) => {
        const base = parseFloat(item.baseTotal) || 0;
        const totals = calculateItemTotals(
          base,
          item.vatType,
          parseFloat(item.irpfPercent) || 0
        );
        acc.base += totals.base;
        acc.iva += totals.iva;
        acc.irpf += totals.irpf;
        acc.total += totals.total;
        return acc;
      },
      { base: 0, iva: 0, irpf: 0, total: 0 }
    );
  };

  const totals = calculateTotals();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.supplier.trim()) {
      alert("El proveedor es obligatorio");
      return;
    }
    if (!formData.department) {
      alert("El departamento es obligatorio");
      return;
    }
    if (
      items.some((item) => !item.description.trim() || !item.accountCode.trim())
    ) {
      alert("Todos los ítems deben tener descripción y código de cuenta");
      return;
    }
    if (items.some((item) => parseFloat(item.baseTotal) <= 0)) {
      alert("Todos los ítems deben tener un importe base mayor a 0");
      return;
    }

    setSaving(true);

    // TODO: Aquí irá la lógica de Firebase
    setTimeout(() => {
      alert("PO creada correctamente (simulado)");
      router.push(`/project/${id}/accounting/pos`);
    }, 1000);
  };

  return (
    <div className={`flex flex-col min-h-screen bg-white ${inter.className}`}>
      {/* Banner superior fino */}
      <div className="mt-[4.5rem] bg-gradient-to-r from-indigo-100 to-indigo-200 border-y border-indigo-200 px-6 md:px-12 py-2 flex items-center justify-center relative">
        <h1 className="text-[13px] font-medium text-indigo-700 tracking-tight text-center">
          {id}
        </h1>
        <Link
          href="/dashboard"
          className="absolute right-6 md:right-12 text-indigo-600 hover:text-indigo-900 transition-colors"
          title="Volver a proyectos"
        >
          <Folder size={16} />
        </Link>
      </div>

      <main className="pb-16 px-6 md:px-12 flex-grow mt-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Link
              href={`/project/${id}/accounting/pos`}
              className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 transition-colors mb-4"
            >
              <ArrowLeft size={16} />
              Volver a Purchase Orders
            </Link>

            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 p-3 rounded-xl shadow-lg">
                <FileText size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-semibold text-slate-900 tracking-tight">
                  Nueva Purchase Order
                </h1>
                <p className="text-slate-600 text-sm mt-1">
                  Completa la información para crear una nueva PO
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información básica */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Información básica
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Proveedor *
                  </label>
                  <input
                    type="text"
                    value={formData.supplier}
                    onChange={(e) =>
                      setFormData({ ...formData, supplier: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none"
                    placeholder="Nombre del proveedor"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Departamento *
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({ ...formData, department: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none"
                    required
                  >
                    <option value="">Selecciona departamento...</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Tipo *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        type: e.target.value as "Servicios" | "Bienes",
                      })
                    }
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none"
                    required
                  >
                    <option value="Servicios">Servicios</option>
                    <option value="Bienes">Bienes</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="requiresHod"
                    checked={formData.requiresHod}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        requiresHod: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-400"
                  />
                  <label
                    htmlFor="requiresHod"
                    className="ml-2 text-sm text-slate-700"
                  >
                    Requiere aprobación del HOD
                  </label>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none"
                  rows={3}
                  placeholder="Descripción general de la PO..."
                />
              </div>
            </div>

            {/* Ítems */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">
                  Ítems de la PO
                </h3>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <Plus size={16} />
                  Añadir ítem
                </button>
              </div>

              <div className="space-y-4">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="bg-slate-50 border border-slate-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-slate-700">
                        Ítem {index + 1}
                      </span>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Eliminar ítem"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Código cuenta *
                        </label>
                        <input
                          type="text"
                          value={item.accountCode}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "accountCode",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none"
                          placeholder="601.001"
                          required
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Descripción *
                        </label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "description",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none"
                          placeholder="Descripción del ítem"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Base imponible *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={item.baseTotal}
                          onChange={(e) =>
                            handleItemChange(index, "baseTotal", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none"
                          placeholder="0.00"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">
                            IVA %
                          </label>
                          <select
                            value={item.vatType}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "vatType",
                                parseInt(e.target.value)
                              )
                            }
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none"
                          >
                            <option value={0}>0%</option>
                            <option value={4}>4%</option>
                            <option value={10}>10%</option>
                            <option value={21}>21%</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">
                            IRPF %
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={item.irpfPercent}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "irpfPercent",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none"
                            placeholder="0"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Total del ítem */}
                    {item.baseTotal && (
                      <div className="mt-3 pt-3 border-t border-slate-300">
                        <div className="flex justify-end gap-4 text-xs text-slate-600">
                          <span>
                            IVA:{" "}
                            {formatCurrency(
                              ((parseFloat(item.baseTotal) || 0) *
                                item.vatType) /
                                100
                            )}{" "}
                            €
                          </span>
                          <span>
                            IRPF:{" "}
                            {formatCurrency(
                              ((parseFloat(item.baseTotal) || 0) *
                                (parseFloat(item.irpfPercent) || 0)) /
                                100
                            )}{" "}
                            €
                          </span>
                          <span className="font-semibold text-slate-900">
                            Total:{" "}
                            {formatCurrency(
                              calculateItemTotals(
                                parseFloat(item.baseTotal) || 0,
                                item.vatType,
                                parseFloat(item.irpfPercent) || 0
                              ).total
                            )}{" "}
                            €
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Resumen total */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Resumen total
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Base imponible</p>
                  <p className="text-xl font-bold text-slate-900">
                    {formatCurrency(totals.base)} €
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">IVA</p>
                  <p className="text-xl font-bold text-emerald-700">
                    {formatCurrency(totals.iva)} €
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">IRPF</p>
                  <p className="text-xl font-bold text-amber-700">
                    {formatCurrency(totals.irpf)} €
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Total PO</p>
                  <p className="text-2xl font-bold text-indigo-700">
                    {formatCurrency(totals.total)} €
                  </p>
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3">
              <Link href={`/project/${id}/accounting/pos`}>
                <button
                  type="button"
                  className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors"
                >
                  Cancelar
                </button>
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creando...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Crear PO
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
