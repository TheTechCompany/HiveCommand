import { PrismaClient } from "@prisma/client";
import blowerSparge from "./blower-sparge";
import nfMembrane from "./nf-membrane";
import ufMembrane from "./uf-membrane";

export default async (prisma: PrismaClient) => {
    await blowerSparge(prisma)
    await nfMembrane(prisma)
    await ufMembrane(prisma)   
}