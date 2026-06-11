"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusChip } from "@/components/ui/status-chip";
import { getPendingUsers, getUserById, updateUserStatus } from "@/features/usuarios/api";
import { useAuthStore } from "@/store/auth-store";

export function UserManagementBoard() {
  const token = useAuthStore((state) => state.token);
  const role = useAuthStore((state) => state.role);
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedUserId(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const pendingUsersQuery = useQuery({
    queryKey: ["users", "pending"],
    queryFn: () => getPendingUsers(token as string),
    enabled: Boolean(token) && role === "adminSistema"
  });

  const statusMutation = useMutation({
    mutationFn: updateUserStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", "pending"] });
    }
  });

  const selectedUserQuery = useQuery({
    queryKey: ["users", "detail", selectedUserId],
    queryFn: () => getUserById({ token: token as string, userId: selectedUserId as string }),
    enabled: Boolean(token) && role === "adminSistema" && Boolean(selectedUserId)
  });

  if (role !== "adminSistema") {
    return (
      <EmptyState
        title="Vista restringida"
        description="La gestión de usuarios está disponible solo para el Administrador del sistema."
      />
    );
  }

  if (pendingUsersQuery.isPending) {
    return <p className="text-sm text-muted">Cargando usuarios pendientes...</p>;
  }

  if (pendingUsersQuery.isError) {
    return (
      <EmptyState
        title="No fue posible cargar usuarios"
        description="Comprueba la conexión con el backend o vuelve a iniciar sesión."
      />
    );
  }

  const users = pendingUsersQuery.data ?? [];

  if (!users.length) {
    return (
      <EmptyState
        title="Sin aprobaciones pendientes"
        description="Excelente, no hay registros en estado pendiente por revisar."
      />
    );
  }

  return (
    <section className="space-y-4">
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h1 className="font-[var(--font-heading)] text-2xl font-bold">Aprobación de usuarios</h1>
          <p className="text-sm text-muted">{users.length} solicitudes pendientes</p>
        </div>

        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full text-left text-sm">
            <thead className="text-muted">
              <tr>
                <th className="pb-3">Empresa</th>
                <th className="pb-3">Correo</th>
                <th className="pb-3">Rol</th>
                <th className="pb-3">Estado</th>
                <th className="pb-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr className="border-t border-slate-100" key={user._id}>
                  <td className="py-3 font-medium">{user.nombreEmpresa ?? "Sin nombre"}</td>
                  <td className="py-3">{user.email}</td>
                  <td className="py-3 capitalize">{user.role}</td>
                  <td className="py-3">
                    <StatusChip status={user.estadoRegistro ?? "pendiente"} />
                  </td>
                  <td className="py-3">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" onClick={() => setSelectedUserId(user._id)}>
                        Ver detalle
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() =>
                          statusMutation.mutate({
                            token: token as string,
                            userId: user._id,
                            estado: "aprobado"
                          })
                        }
                      >
                        Aprobar
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() =>
                          statusMutation.mutate({
                            token: token as string,
                            userId: user._id,
                            estado: "rechazado"
                          })
                        }
                      >
                        Rechazar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid gap-3 lg:hidden">
          {users.map((user) => (
            <Card className="bg-canvas" key={user._id}>
              <div className="space-y-2 text-sm">
                <p className="font-semibold">{user.nombreEmpresa ?? "Sin nombre"}</p>
                <p>{user.email}</p>
                <p className="capitalize text-muted">{user.role}</p>
                <StatusChip status={user.estadoRegistro ?? "pendiente"} />
                <div className="mt-2 flex gap-2">
                  <Button className="w-full" variant="ghost" onClick={() => setSelectedUserId(user._id)}>
                    Ver detalle
                  </Button>
                  <Button
                    className="w-full"
                    variant="secondary"
                    onClick={() =>
                      statusMutation.mutate({
                        token: token as string,
                        userId: user._id,
                        estado: "aprobado"
                      })
                    }
                  >
                    Aprobar
                  </Button>
                  <Button
                    className="w-full"
                    variant="danger"
                    onClick={() =>
                      statusMutation.mutate({
                        token: token as string,
                        userId: user._id,
                        estado: "rechazado"
                      })
                    }
                  >
                    Rechazar
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {statusMutation.isError ? (
          <p className="mt-4 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">No se pudo actualizar el estado del usuario.</p>
        ) : null}
      </Card>

      {selectedUserId ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/40 p-4" onClick={() => setSelectedUserId(null)}>
          <div
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            {selectedUserQuery.isPending ? <p className="text-sm text-muted">Cargando detalle del usuario...</p> : null}
            {selectedUserQuery.isError ? (
              <EmptyState title="Error al cargar el usuario" description="No se pudo recuperar el detalle del usuario." />
            ) : null}

            {selectedUserQuery.data ? (
              <div className="space-y-5">
                <div className="flex flex-col gap-2">
                  <h3 className="text-xl font-semibold text-ink">Detalle del usuario</h3>
                  <StatusChip status={selectedUserQuery.data.estadoRegistro ?? "pendiente"} />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold text-muted">Empresa</p>
                    <p className="mt-2 text-sm font-semibold text-ink">{selectedUserQuery.data.nombreEmpresa ?? "Sin nombre"}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold text-muted">Correo</p>
                    <p className="mt-2 text-sm font-semibold text-ink">{selectedUserQuery.data.email}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold text-muted">Rol</p>
                    <p className="mt-2 text-sm font-semibold text-ink capitalize">{selectedUserQuery.data.role}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold text-muted">Sector</p>
                    <p className="mt-2 text-sm font-semibold text-ink">{selectedUserQuery.data.sector ?? "Por definir"}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold text-muted">Formalización</p>
                    <p className="mt-2 text-sm font-semibold text-ink">{selectedUserQuery.data.formalizada ? "Formalizada" : "No formalizada"}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold text-muted">Creado</p>
                    <p className="mt-2 text-sm font-semibold text-ink">
                      {selectedUserQuery.data.createdAt ? new Date(selectedUserQuery.data.createdAt).toLocaleString("es-CO") : "Por definir"}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button variant="secondary" onClick={() => setSelectedUserId(null)}>
                    Cerrar
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
