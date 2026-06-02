# SYS9 CRM Documentation

📋 **Official documentation repository for SYS9 CRM project specifications**

## 🎯 Current Documentation

### **Sale Plan v2 - Excel-style Table Implementation**

Complete specification package for backend development:

| Document | Description | Target Audience |
|----------|-------------|-----------------|
| [📊 Project Overview](sale-plan-v2/01-PROJECT-OVERVIEW.md) | Goals, requirements, design decisions | Product, Backend |
| [📡 API Specification](sale-plan-v2/02-API-SPECIFICATION.md) | **5 endpoints with request/response** | **Backend (Critical)** |
| [🎨 UI Mockups](sale-plan-v2/03-UI-MOCKUPS.md) | Complete UI/UX design specifications | Frontend, QA |
| [🗄️ Database Schema](sale-plan-v2/04-DATABASE-SCHEMA.md) | **Tables, indexes, constraints** | **Backend (Critical)** |
| [💡 Business Logic](sale-plan-v2/05-BUSINESS-LOGIC.md) | **Validation rules, calculations** | **Backend (Critical)** |
| [🤝 Integration Guide](sale-plan-v2/06-INTEGRATION-GUIDE.md) | Step-by-step coordination workflow | Both Teams |
| [🧪 Test Specification](sale-plan-v2/07-TEST-SPECIFICATION.md) | Comprehensive testing strategy | QA, Backend |

## 🚀 Quick Start for Backend Team

### **Implementation Priority:**

```
1. 🗄️ Database Schema (04-DATABASE-SCHEMA.md)
   ↓ CREATE TABLES
2. 📡 API Endpoints (02-API-SPECIFICATION.md) 
   ↓ IMPLEMENT 5 ENDPOINTS
3. 💡 Business Logic (05-BUSINESS-LOGIC.md)
   ↓ VALIDATION & CALCULATIONS
4. 🤝 Integration (06-INTEGRATION-GUIDE.md)
   ↓ FRONTEND COORDINATION
```

### **Key Technical Details:**

- **Module**: `crm`
- **Database**: PostgreSQL recommended
- **API Pattern**: `/crm/v2/projects/{projectId}/saleplan-v2`
- **Authentication**: Bearer token + X-Merchant-UID header
- **Data Structure**: Matrix format `planMatrix[boqId][monthValue] = amount`

## 📊 Project Status

| Component | Status | Description |
|-----------|--------|-------------|
| **Frontend** | ✅ **COMPLETE** | Working prototype with Excel-style table |
| **Backend** | ⏳ **PENDING** | Awaiting API implementation |
| **Documentation** | ✅ **COMPLETE** | Ready for development |
| **Testing** | ⏳ **PENDING** | Awaiting backend API |

## 🎯 Live Demo

- **URL**: http://localhost:3031/projects/123/edit?tab=plan-v2  
- **Features**: Excel-style table, mobile responsive, real-time validation
- **Status**: Working with mock data, ready for real API integration

## 📞 Contact & Coordination

### **Source Repository:**
- **Main Repo**: [github.com/sys9-co/crm](https://github.com/sys9-co/crm) (Private)
- **Branch**: `develop`
- **Frontend Path**: `ui/components/project/saleplan-v2/`

### **Project Management:**
- **Plane**: [Sale Plan v2 Cards](https://plane.sys9.co/sys9/projects/42274dc1-be6c-474d-9883-a7fe72feef44/issues/)
- **Main Feature**: CRM-121 (In Progress)
- **Backend Task**: CRM-123 (Todo)

### **Team Coordination:**
- **Frontend Team**: SYS9 CRM Repository
- **Backend Team**: Implementation based on this specification
- **QA Team**: E2E testing after backend completion

---

## 🔄 Documentation Updates

This repository is **read-only** for external teams. Updates are synced from the main CRM repository.

**Last Sync**: ${new Date().toLocaleDateString('th-TH')}  
**Version**: 1.0.0  
**Specification Status**: ✅ Ready for Implementation

---

## 🎉 Ready for Backend Development!

The complete specification package provides everything needed to implement Sale Plan v2 backend:

- **Detailed API contracts** with examples
- **Complete database schema** with performance considerations  
- **Business logic rules** with validation patterns
- **Integration workflow** for smooth coordination

**🚀 Let's build this together!**