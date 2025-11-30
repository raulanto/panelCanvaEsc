import { ref } from 'vue'
import type { Panel } from '~/types/panel'

export interface AlignmentGuide {
    type: 'vertical' | 'horizontal'
    pos: number // Coordenada X o Y de la línea
    start: number
    length: number
}

export interface MeasurementGuide {
    type: 'horizontal' | 'vertical'
    x: number
    y: number
    length: number
    value: number // El valor en px
}

export const usePanelAlignment = () => {
    const alignmentGuides = ref<AlignmentGuide[]>([])
    const measurementGuides = ref<MeasurementGuide[]>([])

    const limpiarGuias = () => {
        alignmentGuides.value = []
        measurementGuides.value = []
    }

    /**
     * Verifica alineación (snap) y calcula distancias (smart margins)
     */
    const verificarAlineacion = (activePanel: Panel, panels: Panel[], threshold: number = 8) => {
        // Resetear guías
        const newAlignGuides: AlignmentGuide[] = []
        const newMeasureGuides: MeasurementGuide[] = []


        const aRect = {
            l: activePanel.posicion.x,
            r: activePanel.posicion.x + activePanel.tamaño.width,
            t: activePanel.posicion.y,
            b: activePanel.posicion.y + activePanel.tamaño.height,
            cx: activePanel.posicion.x + activePanel.tamaño.width / 2,
            cy: activePanel.posicion.y + activePanel.tamaño.height / 2,
            w: activePanel.tamaño.width,
            h: activePanel.tamaño.height
        }

        let snapX: number | null = null
        let snapY: number | null = null

        let minDistRight = Infinity
        let minDistLeft = Infinity
        let minDistTop = Infinity
        let minDistBottom = Infinity

        let closestRight: MeasurementGuide | null = null
        let closestLeft: MeasurementGuide | null = null
        let closestTop: MeasurementGuide | null = null
        let closestBottom: MeasurementGuide | null = null

        const otherPanels = panels.filter(p => p.id !== activePanel.id)

        for (const other of otherPanels) {
            const bRect = {
                l: other.posicion.x,
                r: other.posicion.x + other.tamaño.width,
                t: other.posicion.y,
                b: other.posicion.y + other.tamaño.height,
                cx: other.posicion.x + other.tamaño.width / 2,
                cy: other.posicion.y + other.tamaño.height / 2
            }


            const xChecks = [
                { val: aRect.l, target: bRect.l, type: 'l' },
                { val: aRect.l, target: bRect.r, type: 'l' },
                { val: aRect.l, target: bRect.cx, type: 'l' },
                { val: aRect.r, target: bRect.l, type: 'r' },
                { val: aRect.r, target: bRect.r, type: 'r' },
                { val: aRect.r, target: bRect.cx, type: 'r' },
                { val: aRect.cx, target: bRect.l, type: 'cx' },
                { val: aRect.cx, target: bRect.r, type: 'cx' },
                { val: aRect.cx, target: bRect.cx, type: 'cx' },
            ]

            for (const check of xChecks) {
                if (Math.abs(check.val - check.target) < threshold) {
                    if (snapX === null) {
                        if (check.type === 'l') snapX = check.target
                        else if (check.type === 'r') snapX = check.target - aRect.w
                        else if (check.type === 'cx') snapX = check.target - aRect.w / 2
                    }
                    // Visualización de la guía
                    const startY = Math.min(aRect.t, bRect.t)
                    const endY = Math.max(aRect.b, bRect.b)
                    newAlignGuides.push({
                        type: 'vertical',
                        pos: check.target,
                        start: startY,
                        length: endY - startY
                    })
                }
            }


            const yChecks = [
                { val: aRect.t, target: bRect.t, type: 't' },
                { val: aRect.t, target: bRect.b, type: 't' },
                { val: aRect.t, target: bRect.cy, type: 't' },
                { val: aRect.b, target: bRect.t, type: 'b' },
                { val: aRect.b, target: bRect.b, type: 'b' },
                { val: aRect.b, target: bRect.cy, type: 'b' },
                { val: aRect.cy, target: bRect.t, type: 'cy' },
                { val: aRect.cy, target: bRect.b, type: 'cy' },
                { val: aRect.cy, target: bRect.cy, type: 'cy' },
            ]

            for (const check of yChecks) {
                if (Math.abs(check.val - check.target) < threshold) {
                    if (snapY === null) {
                        if (check.type === 't') snapY = check.target
                        else if (check.type === 'b') snapY = check.target - aRect.h
                        else if (check.type === 'cy') snapY = check.target - aRect.h / 2
                    }
                    const startX = Math.min(aRect.l, bRect.l)
                    const endX = Math.max(aRect.r, bRect.r)
                    newAlignGuides.push({
                        type: 'horizontal',
                        pos: check.target,
                        start: startX,
                        length: endX - startX
                    })
                }
            }


            const vertOverlapStart = Math.max(aRect.t, bRect.t)
            const vertOverlapEnd = Math.min(aRect.b, bRect.b)
            const hasVertOverlap = vertOverlapStart < vertOverlapEnd

            if (hasVertOverlap) {
                const centerY = (vertOverlapStart + vertOverlapEnd) / 2

                if (bRect.l >= aRect.r) {
                    const dist = bRect.l - aRect.r
                    if (dist < minDistRight) {
                        minDistRight = dist
                        closestRight = { type: 'horizontal', x: aRect.r, y: centerY, length: dist, value: Math.round(dist) }
                    }
                }

                if (aRect.l >= bRect.r) {
                    const dist = aRect.l - bRect.r
                    if (dist < minDistLeft) {
                        minDistLeft = dist
                        closestLeft = { type: 'horizontal', x: bRect.r, y: centerY, length: dist, value: Math.round(dist) }
                    }
                }
            }


            const horzOverlapStart = Math.max(aRect.l, bRect.l)
            const horzOverlapEnd = Math.min(aRect.r, bRect.r)
            const hasHorzOverlap = horzOverlapStart < horzOverlapEnd

            if (hasHorzOverlap) {
                const centerX = (horzOverlapStart + horzOverlapEnd) / 2


                if (bRect.t >= aRect.b) {
                    const dist = bRect.t - aRect.b
                    if (dist < minDistBottom) {
                        minDistBottom = dist
                        closestBottom = { type: 'vertical', x: centerX, y: aRect.b, length: dist, value: Math.round(dist) }
                    }
                }

                if (aRect.t >= bRect.b) {
                    const dist = aRect.t - bRect.b
                    if (dist < minDistTop) {
                        minDistTop = dist
                        closestTop = { type: 'vertical', x: centerX, y: bRect.b, length: dist, value: Math.round(dist) }
                    }
                }
            }
        }


        if (closestRight) newMeasureGuides.push(closestRight)
        if (closestLeft) newMeasureGuides.push(closestLeft)
        if (closestTop) newMeasureGuides.push(closestTop)
        if (closestBottom) newMeasureGuides.push(closestBottom)

        alignmentGuides.value = newAlignGuides
        measurementGuides.value = newMeasureGuides

        return { snapX, snapY }
    }

    return {
        alignmentGuides,
        measurementGuides,
        verificarAlineacion,
        limpiarGuias
    }
}