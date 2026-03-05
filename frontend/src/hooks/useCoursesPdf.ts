'use client'

import { useState } from 'react'
import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { pdfService } from '../services/pdfService'
import type { CoursePdfExportResponse } from '../types/coursePDFType'

// ─────────────────────────────────────────────────────────────
//  Query Keys
// ─────────────────────────────────────────────────────────────

export const pdfKeys = {
  all     : ['pdfs'] as const,
  byCourse: (courseId: number) => ['pdfs', courseId] as const,
}

function toState<T>(q: { data?: T; isPending: boolean; error: Error | null }) {
  return { data: q.data ?? null, loading: q.isPending, error: q.error?.message ?? null }
}

// ═════════════════════════════════════════════════════════════
//  1. useAllCoursePdfs — list all PDFs [ADMIN]
// ═════════════════════════════════════════════════════════════

export function useAllCoursePdfs() {
  const query = useQuery({
    queryKey: pdfKeys.all,
    queryFn : () => pdfService.getAll(),
  })
  return { ...toState<CoursePdfExportResponse[]>(query), refetch: query.refetch }
}

// ═════════════════════════════════════════════════════════════
//  2. useCoursePdf — single course PDF (public)
// ═════════════════════════════════════════════════════════════

export function useCoursePdf(courseId: number) {
  const qc    = useQueryClient()
  const query = useQuery({
    queryKey: pdfKeys.byCourse(courseId),
    queryFn : () => pdfService.getByCourse(courseId),
    enabled : !!courseId,
  })

  const [downloading, setDownloading] = useState(false)

  const incrementDownload = async (): Promise<CoursePdfExportResponse | null> => {
    if (!courseId) return null
    setDownloading(true)
    try {
      const result = await pdfService.incrementDownload(courseId)
      qc.setQueryData(pdfKeys.byCourse(courseId), result)
      return result
    } catch {
      return null
    } finally {
      setDownloading(false)
    }
  }

  return { ...toState<CoursePdfExportResponse>(query), refetch: query.refetch, downloading, incrementDownload }
}

// ═════════════════════════════════════════════════════════════
//  3. useCoursePdfAdmin — generate + delete [ADMIN]
// ═════════════════════════════════════════════════════════════

export function useCoursePdfAdmin() {
  const qc = useQueryClient()

  const generateMutation = useMutation({
    mutationFn: (courseId: number) => pdfService.generate(courseId),
    onSuccess : (data) => {
      qc.setQueryData(pdfKeys.byCourse(data.courseId), data)
      qc.invalidateQueries({ queryKey: pdfKeys.all })
    },
  })

  const removeMutation = useMutation({
    mutationFn: (courseId: number) => pdfService.remove(courseId),
    onSuccess : (_, courseId) => {
      qc.removeQueries({ queryKey: pdfKeys.byCourse(courseId) })
      qc.invalidateQueries({ queryKey: pdfKeys.all })
    },
  })

  return {
    generating: generateMutation.isPending,
    removing  : removeMutation.isPending,
    error     : (generateMutation.error ?? removeMutation.error)?.message ?? null,
    generate  : (courseId: number) => generateMutation.mutateAsync(courseId),
    remove    : (courseId: number) =>
      removeMutation.mutateAsync(courseId).then(() => true as const).catch(() => false as const),
  }
}