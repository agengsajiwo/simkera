import Link from "next/link"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { DocumentTypeBadge } from "./DocumentTypeBadge"
import { AlertTriangle, CheckCircle } from "lucide-react"

interface TreeDocument {
  id: string
  type: string
  title: string
  partnerName: string
  status: string
  mouChildren?: TreeDocument[]
  moaChildren?: TreeDocument[]
}

interface HierarchyTreeProps {
  documents: TreeDocument[]
}

export function HierarchyTree({ documents }: HierarchyTreeProps) {
  const mous = documents.filter((d) => d.type === "MOU")

  return (
    <Accordion className="space-y-3">
      {mous.map((mou) => {
        const linkedMoas = documents.filter((d) => d.type === "MOA" && (d as any).mouId === mou.id)
        const hasMoa = linkedMoas.length > 0
        const hasIa = linkedMoas.some((moa) =>
          documents.some((d) => d.type === "IA" && (d as any).moaId === moa.id)
        )

        return (
          <AccordionItem key={mou.id} value={mou.id} className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3 text-left">
                <DocumentTypeBadge type="MOU" />
                <div>
                  <p className="font-medium text-sm text-gray-800">{mou.title}</p>
                  <p className="text-xs text-gray-500">{mou.partnerName}</p>
                </div>
                {!hasMoa && (
                  <Badge variant="outline" className="ml-2 text-xs bg-red-50 text-red-600 border-red-200">
                    <AlertTriangle className="h-3 w-3 mr-1" />Belum ada MoA
                  </Badge>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              {linkedMoas.length === 0 ? (
                <p className="text-sm text-gray-400 py-2">Belum ada MoA yang terhubung ke MoU ini.</p>
              ) : (
                <div className="space-y-2 pl-4 border-l-2 border-purple-200 ml-2">
                  {linkedMoas.map((moa) => {
                    const linkedIas = documents.filter(
                      (d) => d.type === "IA" && (d as any).moaId === moa.id
                    )
                    return (
                      <div key={moa.id} className="pt-2">
                        <Link href={`/documents/${moa.id}`} className="flex items-center gap-2 hover:text-[#2563eb]">
                          <DocumentTypeBadge type="MOA" />
                          <span className="text-sm font-medium">{moa.title}</span>
                          {linkedIas.length === 0 && (
                            <Badge variant="outline" className="text-xs bg-amber-50 text-amber-600 border-amber-200">
                              <AlertTriangle className="h-3 w-3 mr-1" />Belum ada IA
                            </Badge>
                          )}
                        </Link>
                        {linkedIas.length > 0 && (
                          <div className="mt-1 space-y-1 pl-4 border-l-2 border-orange-200 ml-2">
                            {linkedIas.map((ia) => (
                              <Link key={ia.id} href={`/documents/${ia.id}`}
                                className="flex items-center gap-2 py-0.5 hover:text-[#2563eb]">
                                <DocumentTypeBadge type="IA" />
                                <span className="text-xs text-gray-600">{ia.title}</span>
                                <CheckCircle className="h-3 w-3 text-green-500 ml-auto" />
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        )
      })}
    </Accordion>
  )
}
