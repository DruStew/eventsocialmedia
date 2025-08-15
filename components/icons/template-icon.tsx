import { FileText } from "lucide-react"

interface TemplateIconProps {
  className?: string
}

export default function TemplateIcon({ className }: TemplateIconProps) {
  return <FileText className={className} />
}
