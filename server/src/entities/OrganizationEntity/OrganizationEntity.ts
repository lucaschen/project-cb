import { Organization } from "~db/models/Organization";

import { staticImplements, type StaticMethods } from "../types";
import addUser from "./instanceMethods/addUser";
import cancelInvite from "./instanceMethods/cancelInvite";
import countAdmins from "./instanceMethods/countAdmins";
import createInvite from "./instanceMethods/createInvite";
import findMembers from "./instanceMethods/findMembers";
import findPendingInvites from "./instanceMethods/findPendingInvites";
import getAdminDetail from "./instanceMethods/getAdminDetail";
import getSummary from "./instanceMethods/getSummary";
import removeMember from "./instanceMethods/removeMember";
import softDelete from "./instanceMethods/softDelete";
import updateMemberPermissions from "./instanceMethods/updateMemberPermissions";
import updateSettings from "./instanceMethods/updateSettings";
import create from "./staticMethods/create";
import findById from "./staticMethods/findById";

@staticImplements<
  StaticMethods<typeof OrganizationEntity, OrganizationEntity>
>()
export default class OrganizationEntity {
  dbModel: Organization;

  constructor(organization: Organization) {
    this.dbModel = organization;
  }

  // PARTITION: Static methods
  static create = create;
  static findById = findById;

  // PARTITION: Instance methods
  addUser = addUser;
  cancelInvite = cancelInvite;
  countAdmins = countAdmins;
  createInvite = createInvite;
  findMembers = findMembers;
  findPendingInvites = findPendingInvites;
  getAdminDetail = getAdminDetail;
  getSummary = getSummary;
  removeMember = removeMember;
  softDelete = softDelete;
  updateMemberPermissions = updateMemberPermissions;
  updateSettings = updateSettings;
}
