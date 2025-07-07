-- Create notification logs table to track sent reminders
CREATE TABLE public.notification_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('4_weeks', '3_weeks', '2_weeks', '1_week', '1_day')),
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own notification logs" 
ON public.notification_logs 
FOR SELECT 
USING (
  document_id IN (
    SELECT id FROM public.documents WHERE user_id = auth.uid()
  )
);

-- Create index for better performance
CREATE INDEX idx_notification_logs_document_reminder ON public.notification_logs(document_id, reminder_type);
CREATE INDEX idx_notification_logs_sent_at ON public.notification_logs(sent_at);