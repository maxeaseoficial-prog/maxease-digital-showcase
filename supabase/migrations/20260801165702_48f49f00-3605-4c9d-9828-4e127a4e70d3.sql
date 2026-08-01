DROP POLICY IF EXISTS "authenticated reads tenants" ON public.tenants;

CREATE POLICY "client reads own tenant"
ON public.tenants
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.clients c
    WHERE c.id = auth.uid() AND c.tenant_id = tenants.id
  )
  OR public.has_role(auth.uid(), 'admin'::app_role)
);

REVOKE EXECUTE ON FUNCTION public.tg_set_updated_at() FROM PUBLIC, anon, authenticated;