-- Flat thread pagination: thread_root_id + thread_depth for nested reply-to-reply.

ALTER TABLE public.comments
  ADD COLUMN IF NOT EXISTS thread_root_id BIGINT REFERENCES public.comments (id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS thread_depth SMALLINT NOT NULL DEFAULT 0;

-- Walk parent_id chains so existing nested rows get root + depth.
WITH RECURSIVE thread_tree AS (
  SELECT
    id,
    id AS root_id,
    0::SMALLINT AS depth
  FROM public.comments
  WHERE parent_id IS NULL

  UNION ALL

  SELECT
    c.id,
    t.root_id,
    (t.depth + 1)::SMALLINT
  FROM public.comments c
  INNER JOIN thread_tree t ON c.parent_id = t.id
)
UPDATE public.comments c
SET
  thread_root_id = CASE WHEN t.depth = 0 THEN NULL ELSE t.root_id END,
  thread_depth = t.depth
FROM thread_tree t
WHERE c.id = t.id;

ALTER TABLE public.comments
  DROP CONSTRAINT IF EXISTS comments_thread_shape_check;

ALTER TABLE public.comments
  ADD CONSTRAINT comments_thread_shape_check
  CHECK (
    (
      parent_id IS NULL
      AND thread_root_id IS NULL
      AND thread_depth = 0
    )
    OR (
      parent_id IS NOT NULL
      AND thread_root_id IS NOT NULL
      AND thread_depth > 0
    )
  );

CREATE INDEX IF NOT EXISTS comments_thread_root_created_idx
  ON public.comments (thread_root_id, created_at ASC, id ASC)
  WHERE thread_root_id IS NOT NULL AND is_deleted = false;
