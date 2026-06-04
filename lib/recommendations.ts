import { prisma } from "./db"
import { generateRecommendationsAI } from "./ai"
import { PRODI_CONTEXT } from "./prodi-context"

export async function generateRecommendationsForDocument(
  documentId: string,
  userId: string
) {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
  })

  if (!document || document.type !== "MOU") {
    return { count: 0, recommendations: [] }
  }

  const prodiContext = PRODI_CONTEXT[document.prodiName] || ""

  const items = await generateRecommendationsAI({
    partnerName: document.partnerName,
    partnerType: document.partnerType,
    cooperationField: document.cooperationField,
    sector: document.sector,
    prodiName: document.prodiName,
    aiSummary: document.aiSummary,
    prodiContext,
  })

  const created = await prisma.$transaction(
    items.map((item) =>
      prisma.recommendation.create({
        data: {
          sourceDocumentId: documentId,
          prodiName: document.prodiName,
          type: item.type,
          recommendedTitle: item.recommendedTitle,
          theme: item.theme,
          topicSuggestions: JSON.stringify(item.topicSuggestions),
          impactAreas: JSON.stringify(item.impactAreas),
          impactLevel: item.impactLevel,
          rationale: item.rationale,
          draftScope: item.draftScope,
          targetBeneficiary: item.targetBeneficiary,
          estimatedDuration: item.estimatedDuration,
          exampleActivities: JSON.stringify(item.exampleActivities),
          priority: item.priority,
          status: "PENDING",
          aiGenerated: true,
        },
      })
    )
  )

  await prisma.activityLog.create({
    data: {
      userId,
      action: "GENERATE_RECOMMENDATIONS",
      description: `Generated ${created.length} recommendations for document: ${document.title}`,
      metadata: JSON.stringify({ documentId, count: created.length }),
    },
  })

  return { count: created.length, recommendations: created }
}
