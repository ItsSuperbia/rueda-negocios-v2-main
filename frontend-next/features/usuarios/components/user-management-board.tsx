"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusChip } from "@/components/ui/status-chip";
import { getPendingUsers, updateUserStatus } from "@/features/usuarios/api";
import { useAuthStore } from "@/store/auth-store";

export function UserManagementBoard() {
  const token = useAuthStore((state) => state.token);
  const role = useAuthStore((state) => state.role);
  const queryClient = useQueryClient();

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
    </section>
  );
}
