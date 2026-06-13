import Link from "next/link";
import { Card } from "@/components/ui/card";

export default function ProteccionDatosPage() {
  return (
    <main className="bg-[radial-gradient(circle_at_top,_rgba(15,139,141,0.12),_transparent_35%),linear-gradient(180deg,_#f7fafc_0%,_#eef6f7_100%)] px-4 py-10 text-ink sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl space-y-6">
        <Card className="fade-up bg-gradient-to-br from-[#0f8b8d] to-[#115f67] text-white ring-transparent">
          <p className="text-sm text-white/80">Decreto 1074 de 2015</p>
          <h1 className="mt-2 font-[var(--font-heading)] text-3xl font-bold sm:text-4xl">
            Política de Tratamiento y Protección de Datos Personales
          </h1>
          <p className="mt-3 max-w-3xl text-sm text-white/80">
            Información sobre la recolección, almacenamiento, uso, circulación y supresión de datos personales en la plataforma de Rueda de Negocios.
          </p>
        </Card>

        <Card className="space-y-8 bg-white/95">
          <section>
            <h2 className="text-xl font-semibold text-ink">1. Identificación del Responsable del Tratamiento</h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              La Plataforma de Rueda de Negocios es responsable del tratamiento de los datos personales recolectados a través de este sitio web.
            </p>
            <div className="mt-4 grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-ink ring-1 ring-slate-200 sm:grid-cols-2">
              <p><span className="font-semibold">Responsable:</span> Nombre de la organización o entidad responsable</p>
              <p><span className="font-semibold">NIT:</span> NIT de la organización</p>
              <p><span className="font-semibold">Dirección:</span> Dirección física</p>
              <p><span className="font-semibold">Correo electrónico:</span> correo@organizacion.com</p>
              <p><span className="font-semibold">Teléfono:</span> Número de contacto</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink">2. Objetivo de la Política</h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              La presente Política de Tratamiento y Protección de Datos Personales tiene como finalidad informar a los usuarios sobre la recolección, almacenamiento, uso, circulación y supresión de sus datos personales, garantizando el cumplimiento de la Ley 1581 de 2012, el Decreto 1074 de 2015 y demás normas que regulan la protección de datos personales en Colombia.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink">3. Datos Personales Recolectados</h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              La plataforma podrá recolectar información suministrada voluntariamente por los usuarios durante los procesos de registro, participación en eventos y uso de los servicios ofrecidos.
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-muted">
              <li>Nombre completo.</li>
              <li>Documento de identificación.</li>
              <li>Correo electrónico.</li>
              <li>Número telefónico.</li>
              <li>Cargo.</li>
              <li>Información de empresa u organización.</li>
              <li>Datos de contacto empresarial.</li>
              <li>Documentos de soporte cargados por el usuario.</li>
              <li>Información relacionada con reuniones, agendas y participación en eventos.</li>
              <li>Información estadística derivada del uso de la plataforma.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink">4. Finalidades del Tratamiento de los Datos</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-muted">
              <li>Gestionar el registro y autenticación de usuarios.</li>
              <li>Validar la información suministrada por empresas y participantes.</li>
              <li>Administrar la participación en ruedas de negocio y eventos empresariales.</li>
              <li>Facilitar la generación de encuentros comerciales entre empresas y clientes.</li>
              <li>Gestionar agendas, citas y reuniones.</li>
              <li>Enviar notificaciones relacionadas con eventos, reuniones y actividades de la plataforma.</li>
              <li>Generar reportes estadísticos e indicadores de gestión.</li>
              <li>Atender solicitudes, consultas, peticiones, quejas y reclamos.</li>
              <li>Garantizar la seguridad y correcto funcionamiento de la plataforma.</li>
              <li>Cumplir obligaciones legales y regulatorias aplicables.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink">5. Derechos de los Titulares de los Datos</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-muted">
              <li>Conocer, actualizar y rectificar sus datos personales.</li>
              <li>Solicitar prueba de la autorización otorgada para el tratamiento.</li>
              <li>Ser informados sobre el uso dado a sus datos personales.</li>
              <li>Presentar consultas o reclamos relacionados con el tratamiento.</li>
              <li>Solicitar la supresión de sus datos cuando sea procedente.</li>
              <li>Revocar la autorización otorgada para el tratamiento de datos personales.</li>
              <li>Acceder gratuitamente a los datos personales que hayan sido objeto de tratamiento.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink">6. Procedimiento para Consultas</h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              Los titulares podrán presentar consultas relacionadas con sus datos personales mediante los canales de contacto definidos por la organización.
            </p>
            <div className="mt-3 rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-muted ring-1 ring-slate-200">
              <p className="font-semibold text-ink">Procedimiento</p>
              <ol className="mt-2 list-decimal space-y-2 pl-5">
                <li>La solicitud deberá enviarse por correo electrónico o mediante los canales habilitados.</li>
                <li>La consulta deberá contener la identificación del titular y la descripción de la solicitud.</li>
                <li>La organización responderá dentro de los términos establecidos por la ley.</li>
              </ol>
              <p className="mt-3 font-semibold text-ink">Tiempo de respuesta</p>
              <p className="mt-2">
                Las consultas serán atendidas dentro de un plazo máximo de diez (10) días hábiles contados a partir de su recepción. Cuando no sea posible responder dentro de dicho término, se informará al solicitante indicando los motivos de la demora y la fecha estimada de respuesta.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink">7. Procedimiento para Reclamos</h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              Cuando el titular considere que la información almacenada debe ser corregida, actualizada o eliminada, podrá presentar un reclamo.
            </p>
            <div className="mt-3 rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-muted ring-1 ring-slate-200">
              <p className="font-semibold text-ink">Procedimiento</p>
              <ol className="mt-2 list-decimal space-y-2 pl-5">
                <li>Presentar la solicitud por escrito a través de los canales de atención establecidos.</li>
                <li>Indicar claramente los hechos que motivan el reclamo.</li>
                <li>Adjuntar la documentación que soporte la solicitud, cuando sea necesario.</li>
              </ol>
              <p className="mt-3 font-semibold text-ink">Tiempo de respuesta</p>
              <p className="mt-2">
                Los reclamos serán atendidos dentro de los quince (15) días hábiles siguientes a la fecha de recepción.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink">8. Seguridad de la Información</h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              La plataforma implementa medidas técnicas, administrativas y organizacionales orientadas a proteger los datos personales contra pérdida, acceso no autorizado, alteración, divulgación o uso indebido.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink">9. Autorización para el Tratamiento de Datos Personales</h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              Al registrarse en la plataforma y aceptar la presente política, el usuario autoriza de manera previa, expresa e informada el tratamiento de sus datos personales para las finalidades aquí descritas.
            </p>
            <p className="mt-3 text-sm leading-7 text-muted">
              La autorización podrá ser revocada en cualquier momento mediante solicitud formal, salvo cuando exista un deber legal o contractual que impida su eliminación inmediata.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink">10. Vigencia</h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              La presente Política de Tratamiento y Protección de Datos Personales entra en vigencia a partir del 11 de junio de 2026.
            </p>
            <p className="mt-3 text-sm leading-7 text-muted">
              Las bases de datos administradas por la plataforma permanecerán vigentes durante el tiempo necesario para cumplir las finalidades descritas en esta política o mientras exista una obligación legal que requiera su conservación.
            </p>
            <p className="mt-3 text-sm font-semibold text-ink">Última actualización: 11 - junio - 2026</p>
          </section>

          <div className="flex justify-end border-t border-slate-200 pt-4">
            <Link className="rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-95" href="/register">
              Volver al registro
            </Link>
          </div>
        </Card>
      </div>
    </main>
  );
}