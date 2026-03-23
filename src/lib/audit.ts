import { supabaseAdmin } from "./supabase";

export async function logAction({
  actorId,
  action,
  entityType,
  entityId,
  metadata
}: {
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: any;
}) {
  try {
    await supabaseAdmin.from('audit_logs').insert([{
      actor_id: actorId || null,
      action,
      entity_type: entityType,
      entity_id: entityId || null,
      metadata: metadata || {}
    }]);
  } catch (error) {
    console.error("No se pudo guardar el log de auditoria", error);
  }
}
