# Sale Plan v2 - Business Logic & Validation Rules

## 🎯 Business Requirements

**Module**: `crm`  
**Component**: Sale Plan v2 Excel-style Planning Interface  

## 📊 Core Business Logic

### **1. Planning Matrix Structure**
```typescript
interface PlanMatrix {
  [boqId: number]: {
    [monthValue: string]: number  // "2026-06" => amount in Thai Baht
  }
}
```

### **2. Timeline Generation Logic**
```typescript
function generateProjectTimeline(startDate: string, endDate: string): TimelineMonth[] {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const months: TimelineMonth[] = []
  
  // Start from first day of start month
  let current = new Date(start.getFullYear(), start.getMonth(), 1)
  
  // End at last day of end month
  const endMonth = new Date(end.getFullYear(), end.getMonth() + 1, 1)
  
  while (current < endMonth) {
    months.push({
      value: `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`,
      name: formatMonthThaiDate(current, 'full'),       // "มิถุนายน 2569"
      displayShort: formatMonthThaiDate(current, 'short'), // "มิ.ย. 69"
      isInProject: current >= start && current <= end
    })
    current.setMonth(current.getMonth() + 1)
  }
  
  return months
}
```

## ⚠️ Validation Rules

### **Input Validation**

#### **1. Amount Validation**
```typescript
interface AmountValidation {
  min: number = 0                    // Cannot be negative
  max: number = 999_999_999_999.99  // 15 digits max
  decimals: number = 2              // Max 2 decimal places
  required: boolean = false         // Empty cells allowed
}

function validateAmount(amount: string | number): ValidationResult {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  
  if (isNaN(numAmount)) {
    return { valid: false, message: 'กรุณากรอกตัวเลขที่ถูกต้อง' }
  }
  
  if (numAmount < 0) {
    return { valid: false, message: 'จำนวนเงินไม่สามารถติดลบได้' }
  }
  
  if (numAmount > 999_999_999_999.99) {
    return { valid: false, message: 'จำนวนเงินเกินขีดจำกัด' }
  }
  
  // Check decimal places
  const decimalPlaces = (numAmount.toString().split('.')[1] || '').length
  if (decimalPlaces > 2) {
    return { valid: false, message: 'ทศนิยมได้สูงสุด 2 ตำแหน่ง' }
  }
  
  return { valid: true, message: null }
}
```

#### **2. Month Period Validation**
```typescript
function validateMonthPeriod(monthValue: string): ValidationResult {
  const monthRegex = /^[0-9]{4}-[0-9]{2}$/
  
  if (!monthRegex.test(monthValue)) {
    return { valid: false, message: 'รูปแบบเดือนต้องเป็น YYYY-MM' }
  }
  
  const [year, month] = monthValue.split('-').map(Number)
  
  if (year < 2020 || year > 2050) {
    return { valid: false, message: 'ปีต้องอยู่ระหว่าง 2020-2050' }
  }
  
  if (month < 1 || month > 12) {
    return { valid: false, message: 'เดือนต้องอยู่ระหว่าง 01-12' }
  }
  
  return { valid: true, message: null }
}
```

### **Business Logic Validation**

#### **1. BOQ Overflow Detection**
```typescript
interface BOQValidation {
  boqId: number
  boqAmount: number
  totalPlanned: number
  overflowAmount: number
  overflowPercentage: number
  status: 'under' | 'exact' | 'over' | 'empty'
  warningLevel: 'none' | 'info' | 'warning' | 'error'
}

function validateBOQAllocation(boqId: number, planMatrix: PlanMatrix, boqAmount: number): BOQValidation {
  const totalPlanned = Object.values(planMatrix[boqId] || {})
    .reduce((sum, amount) => sum + (amount || 0), 0)
  
  const overflowAmount = totalPlanned - boqAmount
  const overflowPercentage = boqAmount > 0 ? (overflowAmount / boqAmount) * 100 : 0
  
  let status: BOQValidation['status']
  let warningLevel: BOQValidation['warningLevel']
  
  if (totalPlanned === 0) {
    status = 'empty'
    warningLevel = 'info'
  } else if (totalPlanned < boqAmount) {
    status = 'under'  
    warningLevel = overflowPercentage < -50 ? 'warning' : 'none'
  } else if (totalPlanned === boqAmount) {
    status = 'exact'
    warningLevel = 'none'
  } else {
    status = 'over'
    warningLevel = overflowPercentage > 10 ? 'error' : 'warning'
  }
  
  return {
    boqId,
    boqAmount,
    totalPlanned,
    overflowAmount,
    overflowPercentage,
    status,
    warningLevel
  }
}
```

#### **2. Timeline Validation**
```typescript
function validateTimelineConsistency(
  planMatrix: PlanMatrix, 
  projectStartDate: string, 
  projectEndDate: string
): ValidationResult[] {
  const warnings: ValidationResult[] = []
  const projectStart = new Date(projectStartDate)
  const projectEnd = new Date(projectEndDate)
  
  Object.entries(planMatrix).forEach(([boqId, monthData]) => {
    Object.entries(monthData).forEach(([monthValue, amount]) => {
      if (amount > 0) {
        const [year, month] = monthValue.split('-').map(Number)
        const monthDate = new Date(year, month - 1, 1)
        
        if (monthDate < projectStart || monthDate > projectEnd) {
          warnings.push({
            valid: false,
            message: `BOQ ${boqId}: วางแผนนอกช่วงโครงการ (${monthValue})`,
            type: 'timeline_warning'
          })
        }
      }
    })
  })
  
  return warnings
}
```

## 📊 Calculation Logic

### **1. Summary Calculations**

#### **Row Totals (BOQ Summaries)**
```typescript
function calculateRowTotals(planMatrix: PlanMatrix): Record<number, number> {
  const rowTotals: Record<number, number> = {}
  
  Object.entries(planMatrix).forEach(([boqId, monthData]) => {
    rowTotals[Number(boqId)] = Object.values(monthData)
      .reduce((sum, amount) => sum + (amount || 0), 0)
  })
  
  return rowTotals
}
```

#### **Column Totals (Monthly Summaries)**
```typescript
function calculateColumnTotals(planMatrix: PlanMatrix, timeline: TimelineMonth[]): Record<string, number> {
  const colTotals: Record<string, number> = {}
  
  timeline.forEach(month => {
    colTotals[month.value] = Object.values(planMatrix)
      .reduce((sum, monthData) => sum + (monthData[month.value] || 0), 0)
  })
  
  return colTotals
}
```

#### **Grand Total**
```typescript
function calculateGrandTotal(planMatrix: PlanMatrix): number {
  return Object.values(planMatrix)
    .reduce((grandSum, monthData) => {
      return grandSum + Object.values(monthData)
        .reduce((sum, amount) => sum + (amount || 0), 0)
    }, 0)
}
```

### **2. Progress Calculations**

#### **BOQ Progress Percentage**
```typescript
function calculateBOQProgress(boqId: number, planMatrix: PlanMatrix, boqAmount: number): number {
  const totalPlanned = Object.values(planMatrix[boqId] || {})
    .reduce((sum, amount) => sum + (amount || 0), 0)
  
  return boqAmount > 0 ? (totalPlanned / boqAmount) * 100 : 0
}
```

#### **Project Overall Progress** 
```typescript
function calculateProjectProgress(planMatrix: PlanMatrix, boqItems: BOQItemV2[]): number {
  const totalBOQAmount = boqItems.reduce((sum, boq) => sum + boq.amount, 0)
  const totalPlanned = calculateGrandTotal(planMatrix)
  
  return totalBOQAmount > 0 ? (totalPlanned / totalBOQAmount) * 100 : 0
}
```

## 🔄 Real-time Updates

### **1. Cell Update Logic**
```typescript
function updateCellValue(
  boqId: number, 
  monthValue: string, 
  amount: number,
  planMatrix: PlanMatrix,
  boqItems: BOQItemV2[]
): UpdateResult {
  // 1. Validate input
  const amountValidation = validateAmount(amount)
  if (!amountValidation.valid) {
    return { success: false, error: amountValidation.message }
  }
  
  // 2. Update matrix
  if (!planMatrix[boqId]) planMatrix[boqId] = {}
  planMatrix[boqId][monthValue] = amount
  
  // 3. Recalculate affected summaries
  const rowTotal = calculateRowTotals(planMatrix)[boqId]
  const columnTotal = calculateColumnTotals(planMatrix, timeline)[monthValue]
  
  // 4. Validate BOQ allocation
  const boqItem = boqItems.find(b => b.id === boqId)
  const boqValidation = validateBOQAllocation(boqId, planMatrix, boqItem.amount)
  
  // 5. Return update result
  return {
    success: true,
    rowTotal,
    columnTotal,
    boqValidation,
    grandTotal: calculateGrandTotal(planMatrix)
  }
}
```

### **2. Batch Update Logic**
```typescript
function batchUpdateMatrix(
  updates: CellUpdate[],
  planMatrix: PlanMatrix,
  boqItems: BOQItemV2[]
): BatchUpdateResult {
  const results: UpdateResult[] = []
  const affectedBOQs = new Set<number>()
  const affectedMonths = new Set<string>()
  
  // Apply all updates
  updates.forEach(update => {
    const result = updateCellValue(
      update.boqId, 
      update.monthValue, 
      update.amount, 
      planMatrix, 
      boqItems
    )
    results.push(result)
    affectedBOQs.add(update.boqId)
    affectedMonths.add(update.monthValue)
  })
  
  // Recalculate all affected summaries
  const updatedRowTotals = calculateRowTotals(planMatrix)
  const updatedColumnTotals = calculateColumnTotals(planMatrix, timeline)
  const updatedGrandTotal = calculateGrandTotal(planMatrix)
  
  // Validate all affected BOQs
  const validations = Array.from(affectedBOQs).map(boqId => {
    const boqItem = boqItems.find(b => b.id === boqId)
    return validateBOQAllocation(boqId, planMatrix, boqItem.amount)
  })
  
  return {
    success: results.every(r => r.success),
    results,
    updatedRowTotals,
    updatedColumnTotals,
    updatedGrandTotal,
    validations,
    affectedBOQs: Array.from(affectedBOQs),
    affectedMonths: Array.from(affectedMonths)
  }
}
```

## 🚨 Warning System

### **Warning Types & Levels**

#### **1. BOQ Overflow Warnings**
```typescript
interface BOQOverflowWarning {
  type: 'boq_overflow'
  level: 'warning' | 'error'
  boqId: number
  boqName: string
  overflowAmount: number
  overflowPercentage: number
  message: string
  suggestedAction: string
}

function generateBOQWarnings(validations: BOQValidation[]): BOQOverflowWarning[] {
  return validations
    .filter(v => v.status === 'over')
    .map(v => ({
      type: 'boq_overflow',
      level: v.overflowPercentage > 10 ? 'error' : 'warning',
      boqId: v.boqId,
      boqName: `BOQ ${v.boqId}`, // Should get actual name
      overflowAmount: v.overflowAmount,
      overflowPercentage: v.overflowPercentage,
      message: `เกิน BOQ ${formatCurrency(v.overflowAmount)} (${v.overflowPercentage.toFixed(1)}%)`,
      suggestedAction: 'ลดจำนวนในเดือนใดเดือนหนึ่ง หรือปรับแผนใหม่'
    }))
}
```

#### **2. Timeline Warnings**
```typescript
interface TimelineWarning {
  type: 'timeline_inconsistency'
  level: 'info' | 'warning'
  message: string
  affectedCells: { boqId: number, monthValue: string }[]
}

function generateTimelineWarnings(
  planMatrix: PlanMatrix,
  projectStartDate: string,
  projectEndDate: string
): TimelineWarning[] {
  const warnings: TimelineWarning[] = []
  const projectStart = new Date(projectStartDate)
  const projectEnd = new Date(projectEndDate)
  const affectedCells: { boqId: number, monthValue: string }[] = []
  
  Object.entries(planMatrix).forEach(([boqId, monthData]) => {
    Object.entries(monthData).forEach(([monthValue, amount]) => {
      if (amount > 0) {
        const [year, month] = monthValue.split('-').map(Number)
        const monthDate = new Date(year, month - 1, 1)
        
        if (monthDate < projectStart || monthDate > projectEnd) {
          affectedCells.push({ boqId: Number(boqId), monthValue })
        }
      }
    })
  })
  
  if (affectedCells.length > 0) {
    warnings.push({
      type: 'timeline_inconsistency',
      level: 'warning',
      message: `มีการวางแผนนอกช่วงโครงการ ${affectedCells.length} รายการ`,
      affectedCells
    })
  }
  
  return warnings
}
```

#### **3. Summary Warnings**
```typescript
interface SummaryWarning {
  type: 'project_summary'
  level: 'info' | 'warning' | 'error'
  message: string
  totalBOQAmount: number
  totalPlannedAmount: number
  remainingAmount: number
  overAllocatedAmount: number
}

function generateSummaryWarning(
  planMatrix: PlanMatrix,
  boqItems: BOQItemV2[]
): SummaryWarning {
  const totalBOQAmount = boqItems.reduce((sum, boq) => sum + boq.amount, 0)
  const totalPlannedAmount = calculateGrandTotal(planMatrix)
  const remainingAmount = Math.max(0, totalBOQAmount - totalPlannedAmount)
  const overAllocatedAmount = Math.max(0, totalPlannedAmount - totalBOQAmount)
  
  let level: SummaryWarning['level'] = 'info'
  let message: string
  
  if (overAllocatedAmount > 0) {
    level = 'error'
    message = `วางแผนเกินเป้าหมาย ${formatCurrency(overAllocatedAmount)}`
  } else if (remainingAmount > totalBOQAmount * 0.1) {
    level = 'warning'
    message = `ยังไม่ได้วางแผนครบ ${formatCurrency(remainingAmount)} (${(remainingAmount/totalBOQAmount*100).toFixed(1)}%)`
  } else {
    message = `แผนครบถ้วน ${(totalPlannedAmount/totalBOQAmount*100).toFixed(1)}%`
  }
  
  return {
    type: 'project_summary',
    level,
    message,
    totalBOQAmount,
    totalPlannedAmount,
    remainingAmount,
    overAllocatedAmount
  }
}
```

## 🎯 Business Rules Summary

### **Core Rules:**
1. **Non-negative Amounts**: All amounts must be ≥ 0
2. **Decimal Precision**: Max 2 decimal places
3. **BOQ Overflow**: Warning only, not blocking
4. **Timeline**: Can plan outside project dates with warning
5. **Empty Cells**: Treated as 0 in calculations
6. **Batch Operations**: All-or-nothing for consistency

### **Validation Hierarchy:**
1. **Input Validation** (blocking)
2. **Business Logic Validation** (warnings)
3. **Summary Validation** (informational)

### **Real-time Updates:**
1. **Cell Changes**: Immediate validation and recalculation
2. **Row/Column Updates**: Affected summaries only
3. **Warning Display**: Real-time as user types
4. **Save State**: Track dirty/clean state for batch operations

---

**Business Logic Version**: 1.0  
**Last Updated**: June 1, 2026  
**Validation Rules**: Complete  
**Status**: Ready for Implementation