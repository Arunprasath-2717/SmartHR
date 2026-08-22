# Dayflow Security Configuration

This directory will contain the security access controls for the `dayflow_hrms` module:

## Planned Contents (Phase 2):

1. **Access Control Lists (`ir.model.access.csv`)**:
   - Model-level CRUD permissions for standard and custom models.
   - Defined across distinct roles (Employee, Officer/Manager, Administrator).

2. **Security Groups & Category XML Definitions**:
   - `security_groups.xml`: Custom user groups within the HRMS application hierarchy.

3. **Record Rules XML Definitions**:
   - Multi-company rules and domain filters ensuring employees only access their own records while managers access their department's data.
