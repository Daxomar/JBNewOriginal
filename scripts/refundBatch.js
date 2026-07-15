// // scripts/refundBatch.js
// //
// // Reverses a batch of refunded transactions.
// // Run:  node scripts/refundBatch.js            (LIVE — writes changes + sends emails)
// //       node scripts/refundBatch.js --dry-run  (prints plan, writes nothing, sends nothing)
// //
// // Two kinds of refund row:
// //   A) HAS a Commission (reseller made margin) -> full treatment:
// //        clawback reseller balance, mark commission 'refunded', mark transaction 'refunded',
// //        customer email + reseller summary email.
// //   B) NO Commission (reseller set no markup, so none was ever created) -> transaction-only:
// //        mark transaction 'refunded'. No clawback, no reseller grouping, NO emails.
// //
// // Balance math is NOT floored (negative = implicit debt). Amounts rounded to 2 dp.
// //
// // Payout rejection + actual Paystack refunds are handled separately (not here).
// //
// // BEFORE RUNNING: add 'refunded' to Commission.status AND Transaction.status enums.

// import mongoose from "mongoose";

// import User from "../models/user.model.js";
// import Transaction from "../models/transaction.model.js";
// import Commission from "../models/commission.model.js";

// import { sendCustomerRefundEmail, sendResellerRefundNotice } from "../services/emailServices/email.service.js";


// // const MONGO_URI = "mongodb://mongodb:27017/JBTEST?replicaSet=rs0";

// const AMOUNT_TOLERANCE = 0.01; // float tolerance: transaction.amount vs amountPaid

// // Round to 2 decimals to keep money values clean (avoids 50.899999... drift).
// const money = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

// // ---------------------------------------------------------------------------
// // EDIT THIS — the transactions to refund.
// // ---------------------------------------------------------------------------
// const REFUND_DATA = [
//     { reference: "JBpay_1783645585074_178302", amountPaid: 15.97, amountDue: 15.65 },
//     { reference: "JBpay_1783664844460_785874", amountPaid: 21.12, amountDue: 20.7 },
//     { reference: "JBpay_1783666309206_207175", amountPaid: 6.18, amountDue: 6.05 },
//     { reference: "JBpay_1783666310711_491713", amountPaid: 21.63, amountDue: 21.2 },
//     { reference: "JBpay_1783670573663_102678", amountPaid: 6.7, amountDue: 6.56 },
//     { reference: "JBpay_1783670682491_904905", amountPaid: 49.44, amountDue: 48.47 },
//     { reference: "JBpay_1783671649729_607854", amountPaid: 21.12, amountDue: 20.7 },
//     { reference: "JBpay_1783674357584_555849", amountPaid: 5.97, amountDue: 5.85 },
//     { reference: "JBpay_1783674687819_107219", amountPaid: 48.41, amountDue: 47.46 },
//     { reference: "JBpay_1783675457585_935848", amountPaid: 11.33, amountDue: 11.1 },
//     { reference: "JBpay_1783676906684_391117", amountPaid: 13.39, amountDue: 13.12 },
//     { reference: "JBpay_1783677573462_563044", amountPaid: 28.84, amountDue: 28.27 },
//     { reference: "JBpay_1783678457285_401729", amountPaid: 26.99, amountDue: 26.46 },
//     { reference: "JBpay_1783682113270_630042", amountPaid: 51.5, amountDue: 50.49 },
//     { reference: "JBpay_1783682158644_28129", amountPaid: 7.21, amountDue: 7.06 },
//     { reference: "JBpay_1783683563755_212882", amountPaid: 26.99, amountDue: 26.46 },
//     { reference: "JBpay_1783684009886_149710", amountPaid: 11.33, amountDue: 11.1 },
//     { reference: "JBpay_1783684155178_927283", amountPaid: 49.44, amountDue: 48.47 },
//     { reference: "JBpay_1783687708511_334899", amountPaid: 16.48, amountDue: 16.15 },
//     { reference: "JBpay_1783687810742_134727", amountPaid: 48.41, amountDue: 47.46 },
//     { reference: "JBpay_1783688420236_778539", amountPaid: 51.5, amountDue: 50.49 },
//     { reference: "JBpay_1783688489316_115917", amountPaid: 6.7, amountDue: 6.56 },
//     { reference: "JBpay_1783689399799_438311", amountPaid: 5.77, amountDue: 5.65 },
//     { reference: "JBpay_1783690398718_617505", amountPaid: 48.41, amountDue: 47.46 },
//     { reference: "JBpay_1783690557266_235807", amountPaid: 6.7, amountDue: 6.56 },
//     { reference: "JBpay_1783692470444_369654", amountPaid: 6.18, amountDue: 6.05 },
//     { reference: "JBpay_1783693220417_638638", amountPaid: 15.97, amountDue: 15.65 },
//     { reference: "JBpay_1783695603033_447429", amountPaid: 76.22, amountDue: 74.73 },
//     { reference: "JBpay_1783695680224_614501", amountPaid: 28.84, amountDue: 28.27 },
//     { reference: "JBpay_1783698457802_367749", amountPaid: 6.7, amountDue: 6.56 },
//     { reference: "JBpay_1783700201923_220465", amountPaid: 15.45, amountDue: 15.14 },
//     { reference: "JBpay_1783701320029_610280", amountPaid: 6.7, amountDue: 6.56 },
//     { reference: "JBpay_1783705465679_908600", amountPaid: 38.11, amountDue: 37.36 },
//     { reference: "JBpay_1783706313298_500668", amountPaid: 51.5, amountDue: 50.49 },
//     { reference: "JBpay_1783706999888_367019", amountPaid: 6.7, amountDue: 6.56 },
//     { reference: "JBpay_1783707712563_530817", amountPaid: 7.21, amountDue: 7.06 },
//     { reference: "JBpay_1783708884719_336669", amountPaid: 48.41, amountDue: 47.46 },
//     { reference: "JBpay_1783714042524_785506", amountPaid: 4.65, amountDue: 4.55 },
//     { reference: "JBpay_1783714152821_163543", amountPaid: 6.18, amountDue: 6.05 },
//     { reference: "JBpay_1783714597899_422172", amountPaid: 6.7, amountDue: 6.56 },
//     { reference: "JBpay_1783714682041_69862", amountPaid: 6.7, amountDue: 6.56 },
//     { reference: "JBpay_1783714855246_929295", amountPaid: 12.36, amountDue: 12.11 },
//     { reference: "JBpay_1783714971485_542648", amountPaid: 51.5, amountDue: 50.49 },
//     { reference: "JBpay_1783715378021_384017", amountPaid: 6.7, amountDue: 6.56 },
//     { reference: "JBpay_1783717391066_526318", amountPaid: 16.48, amountDue: 16.15 },
//     { reference: "JBpay_1783717995926_999820", amountPaid: 38.11, amountDue: 37.36 },
//     { reference: "JBpay_1783718189148_418102", amountPaid: 50.47, amountDue: 49.48 },
//     { reference: "JBpay_1783722847006_301873", amountPaid: 6.18, amountDue: 6.05 },
//     { reference: "JBpay_1783749387565_650840", amountPaid: 6.18, amountDue: 6.05 },
//     { reference: "JBpay_1783750743239_377629", amountPaid: 26.99, amountDue: 26.46 },
//     { reference: "JBpay_1783753686635_713856", amountPaid: 6.39, amountDue: 6.26 },
//     { reference: "JBpay_1783754446257_746506", amountPaid: 29.36, amountDue: 28.78 },
//     { reference: "JBpay_1783757362962_831727", amountPaid: 22.66, amountDue: 22.21 },
//     { reference: "JBpay_1783759005235_679988", amountPaid: 51.5, amountDue: 50.49 },
//     { reference: "JBpay_1783760191955_206201", amountPaid: 12.88, amountDue: 12.62 },
// ];

// // ---------------------------------------------------------------------------
// // Validate each entry into a refund candidate.
// //   hasCommission = true  -> reseller clawback path
// //   hasCommission = false -> transaction-only refund (no reseller margin existed)
// // ---------------------------------------------------------------------------
// async function buildCandidates(data) {
//     const candidates = [];
//     const skipped = [];

//     for (const entry of data) {
//         const reference = entry.reference?.trim();
//         const amountPaid = Number(entry.amountPaid);

//         if (!reference) {
//             skipped.push({ reference: null, reason: "Missing reference" });
//             continue;
//         }

//         const transaction = await Transaction.findOne({ reference });

//         if (!transaction) {
//             skipped.push({ reference, reason: "Transaction not found" });
//             continue;
//         }
//         if (transaction.status === "refunded") {
//             skipped.push({ reference, reason: "Already refunded" });
//             continue;
//         }
//         if (transaction.status !== "success") {
//             skipped.push({ reference, reason: `Not refundable — status '${transaction.status}'` });
//             continue;
//         }
//         if (Math.abs(transaction.amount - amountPaid) > AMOUNT_TOLERANCE) {
//             skipped.push({
//                 reference,
//                 reason: `Amount mismatch — DB ${transaction.amount} vs input ${amountPaid}`,
//             });
//             continue;
//         }

//         const commission = await Commission.findOne({ transaction: transaction._id });

//         // No commission = reseller set no markup, so none was ever created.
//         // Still a valid refund: mark the transaction only, no clawback, no email.
//         if (!commission) {
//             candidates.push({
//                 reference,
//                 transaction,
//                 commission: null,
//                 resellerId: null,
//                 clawback: 0,
//                 hasCommission: false,
//                 customerEmail: transaction.email,
//                 bundleName: transaction.bundleName,
//                 phoneNumber: transaction.metadata?.phoneNumberReceivingData,
//                 refundAmount: money(Number(entry.amountDue)),
//             });
//             continue;
//         }

//         if (commission.status === "refunded") {
//             skipped.push({ reference, reason: "Commission already refunded" });
//             continue;
//         }

//         candidates.push({
//             reference,
//             transaction,
//             commission,
//             resellerId: String(commission.reseller),
//             clawback: money(commission.amount),
//             hasCommission: true,
//             customerEmail: transaction.email,
//             bundleName: transaction.bundleName,
//             phoneNumber: transaction.metadata?.phoneNumberReceivingData,
//             refundAmount: money(Number(entry.amountDue)),
//         });
//     }

//     return { candidates, skipped };
// }

// // ---------------------------------------------------------------------------
// // Group candidates by reseller. No-commission candidates go into their own
// // "standalone" bucket (resellerId = null) — transaction-only, not grouped.
// // ---------------------------------------------------------------------------
// function groupByReseller(candidates) {
//     const groups = new Map();
//     const standalone = []; // no-commission, transaction-only refunds

//     for (const c of candidates) {
//         if (!c.hasCommission) {
//             standalone.push(c);
//             continue;
//         }
//         if (!groups.has(c.resellerId)) {
//             groups.set(c.resellerId, { resellerId: c.resellerId, items: [], totalClawback: 0, count: 0 });
//         }
//         const g = groups.get(c.resellerId);
//         g.items.push(c);
//         g.totalClawback = money(g.totalClawback + c.clawback);
//         g.count += 1;
//     }

//     return { groups: [...groups.values()], standalone };
// }

// // ---------------------------------------------------------------------------
// // Fire-and-forget emails — live only, AFTER commit.
// // ---------------------------------------------------------------------------
// function sendGroupEmails(group, user, balanceAfter) {
//     for (const item of group.items) {
//         sendCustomerRefundEmail({
//             to: item.customerEmail,
//             refundAmount: item.refundAmount,
//             bundleName: item.bundleName,
//             reference: item.reference,
//             phoneNumber: item.phoneNumber,
//         }).catch((e) => console.error("Customer email failed:", item.reference, e.message));
//     }

//     if (user.isSystemAccount !== true) {
//         sendResellerRefundNotice({
//             to: user.email,
//             resellerName: user.name,
//             clawedBack: group.totalClawback,
//             transactionsRefunded: group.count,
//             payoutRejected: false,
//             availableBalance: balanceAfter,
//         }).catch((e) => console.error("Reseller email failed:", group.resellerId, e.message));
//     }
// }

// // ---------------------------------------------------------------------------
// // Process ONE reseller group atomically (commission path)
// // ---------------------------------------------------------------------------
// async function processResellerGroup(group, { dryRun }) {
//     const session = await mongoose.startSession();
//     session.startTransaction();

//     try {
//         const user = await User.findById(group.resellerId).session(session);
//         if (!user) {
//             await session.abortTransaction();
//             return { resellerId: group.resellerId, ok: false, reason: "User not found" };
//         }

//         const balanceBefore = money((user.totalCommissionEarned || 0) - (user.totalCommissionPaidOut || 0));
//         const balanceAfter = money(balanceBefore - group.totalClawback);

//         if (!dryRun) {
//             user.totalCommissionEarned = money((user.totalCommissionEarned || 0) - group.totalClawback);
//             user.totalSales -= group.count;
//             await user.save({ session });

//             for (const item of group.items) {
//                 item.commission.status = "refunded";
//                 await item.commission.save({ session });

//                 item.transaction.status = "refunded";
//                 await item.transaction.save({ session });
//             }

//             await session.commitTransaction();
//             // sendGroupEmails(group, user, balanceAfter);
//         } else {
//             await session.abortTransaction();
//         }

//         return {
//             resellerId: group.resellerId,
//             resellerName: user.name,
//             isSystem: user.isSystemAccount === true,
//             ok: true,
//             clawedBack: group.totalClawback,
//             transactionsRefunded: group.count,
//             balanceBefore,
//             balanceAfter,
//             wentNegative: balanceAfter < 0,
//         };
//     } catch (err) {
//         await session.abortTransaction();
//         return { resellerId: group.resellerId, ok: false, reason: err.message };
//     } finally {
//         session.endSession();
//     }
// }

// // ---------------------------------------------------------------------------
// // Process the standalone (no-commission) transaction-only refunds.
// // One atomic session for the whole batch of them — mark transaction 'refunded'.
// // No clawback, no emails.
// // ---------------------------------------------------------------------------
// async function processStandalone(standalone, { dryRun }) {
//     if (standalone.length === 0) return { ok: true, count: 0, refs: [] };

//     const session = await mongoose.startSession();
//     session.startTransaction();

//     try {
//         if (!dryRun) {
//             for (const item of standalone) {
//                 item.transaction.status = "refunded";
//                 await item.transaction.save({ session });
//             }
//             await session.commitTransaction();
//         } else {
//             await session.abortTransaction();
//         }

//         return { ok: true, count: standalone.length, refs: standalone.map((s) => s.reference) };
//     } catch (err) {
//         await session.abortTransaction();
//         return { ok: false, count: 0, reason: err.message, refs: [] };
//     } finally {
//         session.endSession();
//     }
// }

// // ---------------------------------------------------------------------------
// // Orchestrator
// // ---------------------------------------------------------------------------
// async function processRefundBatch(data, { dryRun }) {
//     const { candidates, skipped } = await buildCandidates(data);
//     const { groups, standalone } = groupByReseller(candidates);

//     const results = [];
//     for (const group of groups) {
//         results.push(await processResellerGroup(group, { dryRun }));
//     }

//     const standaloneResult = await processStandalone(standalone, { dryRun });

//     // --- Totals ---
//     // Which resellers committed OK (so we only count their customers' refunds).
//     const okResellerIds = new Set(results.filter((r) => r.ok).map((r) => r.resellerId));

//     // Total refunded to customers = sum of amountDue across all processed rows
//     // (commission rows whose reseller committed OK + all standalone rows).
//     // This is money going BACK to customers.
//     const totalRefundedToCustomers = money(
//         candidates
//             .filter((c) => (c.hasCommission ? okResellerIds.has(c.resellerId) : true))
//             .reduce((sum, c) => sum + c.refundAmount, 0)
//     );

//     // Total clawed back = commission reversed from resellers (commission rows only).
//     const totalClawedBack = money(
//         results.filter((r) => r.ok).reduce((sum, r) => sum + r.clawedBack, 0)
//     );

//     return {
//         dryRun,
//         totalRows: candidates.length + skipped.length,
//         refunded: results.filter((r) => r.ok).reduce((n, r) => n + r.transactionsRefunded, 0),
//         transactionOnlyRefunds: standaloneResult.count,
//         resellersProcessed: results.filter((r) => r.ok).length,
//         totalRefundedToCustomers,
//         totalClawedBack,
//         skipped,
//         failedGroups: results.filter((r) => !r.ok),
//         negativeBalances: results.filter((r) => r.ok && r.wentNegative),
//         results,
//         standaloneResult,
//     };
// }

// // ---------------------------------------------------------------------------
// // Runner
// // ---------------------------------------------------------------------------
// async function main() {
//     const dryRun = process.argv.includes("--dry-run");

//     if (REFUND_DATA.length === 0) {
//         console.error("REFUND_DATA is empty — add the transactions to refund first.");
//         process.exit(1);
//     }

//     await mongoose.connect(MONGO_URI);
//     console.log(`Connected. ${dryRun ? "DRY RUN — no writes, no emails." : "LIVE RUN — writing changes + sending emails."}\n`);

//     const report = await processRefundBatch(REFUND_DATA, { dryRun });

//     console.log("==== REFUND BATCH REPORT ====");
//     console.log(`Mode:                    ${report.dryRun ? "DRY RUN" : "LIVE"}`);
//     console.log(`Entries:                 ${report.totalRows}`);
//     console.log(`Commission refunds:      ${report.refunded}`);
//     console.log(`Transaction-only refunds:${report.transactionOnlyRefunds}`);
//     console.log(`Resellers processed:     ${report.resellersProcessed}`);
//     console.log(`Skipped:                 ${report.skipped.length}`);
//     console.log(`Failed groups:           ${report.failedGroups.length}`);
//     console.log(`Went negative:           ${report.negativeBalances.length}`);

//     console.log(`\n  Total refunded to customers:      GH\u20B5${report.totalRefundedToCustomers.toFixed(2)}`);
//     console.log(`  Total clawed back from resellers: GH\u20B5${report.totalClawedBack.toFixed(2)}`);

//     if (report.skipped.length) {
//         console.log("\n-- Skipped --");
//         report.skipped.forEach((s) => console.log(`  [${s.reference}] ${s.reason}`));
//     }
//     if (report.transactionOnlyRefunds > 0) {
//         console.log("\n-- Transaction-only refunds (no reseller margin, no clawback) --");
//         report.standaloneResult.refs.forEach((ref) => console.log(`  [${ref}]`));
//     }
//     if (report.failedGroups.length) {
//         console.log("\n-- Failed groups --");
//         report.failedGroups.forEach((f) => console.log(`  [${f.resellerId}] ${f.reason}`));
//     }
//     if (report.negativeBalances.length) {
//         console.log("\n-- Negative balances --");
//         report.negativeBalances.forEach((n) =>
//             console.log(`  ${n.resellerName} (${n.resellerId}): ${n.balanceBefore} -> ${n.balanceAfter}`)
//         );
//     }

//     console.log("\n-- Per reseller --");
//     report.results.filter((r) => r.ok).forEach((r) =>
//         console.log(
//             `  ${r.resellerName}${r.isSystem ? " [SYSTEM]" : ""}: ` +
//             `-${r.clawedBack} over ${r.transactionsRefunded} tx, ` +
//             `bal ${r.balanceBefore} -> ${r.balanceAfter}`
//         )
//     );

//     if (!dryRun) await new Promise((res) => setTimeout(res, 3000));

//     await mongoose.disconnect();
//     console.log("\nDone.");
//     process.exit(0);
// }

// main().catch((err) => {
//     console.error("Fatal error:", err);
//     process.exit(1);
// });





// scripts/sendRefundEmails.js
//
// EMAIL-ONLY catch-up. The ledger refund already ran; this ONLY sends the
// notification emails that were skipped (they were commented out). It writes
// NOTHING to the database.
//
// Run:  node scripts/sendRefundEmails.js            (LIVE — sends emails)
//       node scripts/sendRefundEmails.js --dry-run  (prints who WOULD be emailed, sends nothing)
//
// Logic mirrors the refund script:
//   - commission rows  -> customer email + reseller summary email
//   - standalone rows (no commission) -> NO email (matches the refund run)
// Only rows whose transaction is now 'refunded' are considered (idempotent-safe).

import mongoose from "mongoose";

import User from "../models/user.model.js";
import Transaction from "../models/transaction.model.js";
import Commission from "../models/commission.model.js";

import { sendCustomerRefundEmail, sendResellerRefundNotice } from "../services/emailServices/email.service.js";

const MONGO_URI = "mongodb://mongodb:27017/JBTEST?replicaSet=rs0";

const money = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

// SAME list as the refund run.
const REFUND_DATA = [
    { reference: "JBpay_1783645585074_178302", amountPaid: 15.97, amountDue: 15.65 },
    { reference: "JBpay_1783664844460_785874", amountPaid: 21.12, amountDue: 20.7 },
    { reference: "JBpay_1783666309206_207175", amountPaid: 6.18, amountDue: 6.05 },
    { reference: "JBpay_1783666310711_491713", amountPaid: 21.63, amountDue: 21.2 },
    { reference: "JBpay_1783670573663_102678", amountPaid: 6.7, amountDue: 6.56 },
    { reference: "JBpay_1783670682491_904905", amountPaid: 49.44, amountDue: 48.47 },
    { reference: "JBpay_1783671649729_607854", amountPaid: 21.12, amountDue: 20.7 },
    { reference: "JBpay_1783674357584_555849", amountPaid: 5.97, amountDue: 5.85 },
    { reference: "JBpay_1783674687819_107219", amountPaid: 48.41, amountDue: 47.46 },
    { reference: "JBpay_1783675457585_935848", amountPaid: 11.33, amountDue: 11.1 },
    { reference: "JBpay_1783676906684_391117", amountPaid: 13.39, amountDue: 13.12 },
    { reference: "JBpay_1783677573462_563044", amountPaid: 28.84, amountDue: 28.27 },
    { reference: "JBpay_1783678457285_401729", amountPaid: 26.99, amountDue: 26.46 },
    { reference: "JBpay_1783682113270_630042", amountPaid: 51.5, amountDue: 50.49 },
    { reference: "JBpay_1783682158644_28129", amountPaid: 7.21, amountDue: 7.06 },
    { reference: "JBpay_1783683563755_212882", amountPaid: 26.99, amountDue: 26.46 },
    { reference: "JBpay_1783684009886_149710", amountPaid: 11.33, amountDue: 11.1 },
    { reference: "JBpay_1783684155178_927283", amountPaid: 49.44, amountDue: 48.47 },
    { reference: "JBpay_1783687708511_334899", amountPaid: 16.48, amountDue: 16.15 },
    { reference: "JBpay_1783687810742_134727", amountPaid: 48.41, amountDue: 47.46 },
    { reference: "JBpay_1783688420236_778539", amountPaid: 51.5, amountDue: 50.49 },
    { reference: "JBpay_1783688489316_115917", amountPaid: 6.7, amountDue: 6.56 },
    { reference: "JBpay_1783689399799_438311", amountPaid: 5.77, amountDue: 5.65 },
    { reference: "JBpay_1783690398718_617505", amountPaid: 48.41, amountDue: 47.46 },
    { reference: "JBpay_1783690557266_235807", amountPaid: 6.7, amountDue: 6.56 },
    { reference: "JBpay_1783692470444_369654", amountPaid: 6.18, amountDue: 6.05 },
    { reference: "JBpay_1783693220417_638638", amountPaid: 15.97, amountDue: 15.65 },
    { reference: "JBpay_1783695603033_447429", amountPaid: 76.22, amountDue: 74.73 },
    { reference: "JBpay_1783695680224_614501", amountPaid: 28.84, amountDue: 28.27 },
    { reference: "JBpay_1783698457802_367749", amountPaid: 6.7, amountDue: 6.56 },
    { reference: "JBpay_1783700201923_220465", amountPaid: 15.45, amountDue: 15.14 },
    { reference: "JBpay_1783701320029_610280", amountPaid: 6.7, amountDue: 6.56 },
    { reference: "JBpay_1783705465679_908600", amountPaid: 38.11, amountDue: 37.36 },
    { reference: "JBpay_1783706313298_500668", amountPaid: 51.5, amountDue: 50.49 },
    { reference: "JBpay_1783706999888_367019", amountPaid: 6.7, amountDue: 6.56 },
    { reference: "JBpay_1783707712563_530817", amountPaid: 7.21, amountDue: 7.06 },
    { reference: "JBpay_1783708884719_336669", amountPaid: 48.41, amountDue: 47.46 },
    { reference: "JBpay_1783714042524_785506", amountPaid: 4.65, amountDue: 4.55 },
    { reference: "JBpay_1783714152821_163543", amountPaid: 6.18, amountDue: 6.05 },
    { reference: "JBpay_1783714597899_422172", amountPaid: 6.7, amountDue: 6.56 },
    { reference: "JBpay_1783714682041_69862", amountPaid: 6.7, amountDue: 6.56 },
    { reference: "JBpay_1783714855246_929295", amountPaid: 12.36, amountDue: 12.11 },
    { reference: "JBpay_1783714971485_542648", amountPaid: 51.5, amountDue: 50.49 },
    { reference: "JBpay_1783715378021_384017", amountPaid: 6.7, amountDue: 6.56 },
    { reference: "JBpay_1783717391066_526318", amountPaid: 16.48, amountDue: 16.15 },
    { reference: "JBpay_1783717995926_999820", amountPaid: 38.11, amountDue: 37.36 },
    { reference: "JBpay_1783718189148_418102", amountPaid: 50.47, amountDue: 49.48 },
    { reference: "JBpay_1783722847006_301873", amountPaid: 6.18, amountDue: 6.05 },
    { reference: "JBpay_1783749387565_650840", amountPaid: 6.18, amountDue: 6.05 },
    { reference: "JBpay_1783750743239_377629", amountPaid: 26.99, amountDue: 26.46 },
    { reference: "JBpay_1783753686635_713856", amountPaid: 6.39, amountDue: 6.26 },
    { reference: "JBpay_1783754446257_746506", amountPaid: 29.36, amountDue: 28.78 },
    { reference: "JBpay_1783757362962_831727", amountPaid: 22.66, amountDue: 22.21 },
    { reference: "JBpay_1783759005235_679988", amountPaid: 51.5, amountDue: 50.49 },
    { reference: "JBpay_1783760191955_206201", amountPaid: 12.88, amountDue: 12.62 },
];

async function main() {
    const dryRun = process.argv.includes("--dry-run");

    await mongoose.connect(MONGO_URI);
    console.log(`Connected. ${dryRun ? "DRY RUN — no emails sent." : "LIVE — sending emails."}\n`);

    // Build customer email list + per-reseller aggregation, from the ALREADY-refunded data.
    const customerEmails = []; // { to, refundAmount, bundleName, reference, phoneNumber }
    const resellerAgg = new Map(); // resellerId -> { user, totalClawback, count }
    const skipped = [];

    for (const entry of REFUND_DATA) {
        const reference = entry.reference?.trim();
        const transaction = await Transaction.findOne({ reference });

        if (!transaction) {
            skipped.push({ reference, reason: "Transaction not found" });
            continue;
        }
        // Only email for rows the refund actually processed.
        if (transaction.status !== "refunded") {
            skipped.push({ reference, reason: `Not refunded (status '${transaction.status}') — skipping email` });
            continue;
        }

        const commission = await Commission.findOne({ transaction: transaction._id });

        if (!commission) {
            // Standalone row — matches refund run: NO email.
            skipped.push({ reference, reason: "No commission (standalone) — no email by design" });
            continue;
        }

        // Customer email for this commission row.
        customerEmails.push({
            to: transaction.email,
            refundAmount: money(Number(entry.amountDue)),
            bundleName: transaction.bundleName,
            reference,
            phoneNumber: transaction.metadata?.phoneNumberReceivingData,
        });

        // Aggregate reseller summary.
        const rid = String(commission.reseller);
        if (!resellerAgg.has(rid)) {
            const user = await User.findById(rid);
            resellerAgg.set(rid, { user, totalClawback: 0, count: 0 });
        }
        const agg = resellerAgg.get(rid);
        agg.totalClawback = money(agg.totalClawback + commission.amount);
        agg.count += 1;
    }

    console.log(`Customer emails to send: ${customerEmails.length}`);
    console.log(`Reseller emails to send: ${[...resellerAgg.values()].filter(a => a.user && a.user.isSystemAccount !== true).length}`);
    console.log(`Skipped (no email):      ${skipped.length}\n`);

    if (dryRun) {
        console.log("-- Customers who WOULD be emailed --");
        customerEmails.forEach((c) => console.log(`  ${c.to}  GH\u20B5${c.refundAmount.toFixed(2)}  [${c.reference}]`));
        console.log("\n-- Resellers who WOULD be emailed --");
        [...resellerAgg.values()].forEach((a) => {
            if (!a.user) return;
            const tag = a.user.isSystemAccount === true ? " [SYSTEM — skipped]" : "";
            console.log(`  ${a.user.name}${tag}: -${a.totalClawback} over ${a.count} tx`);
        });
        console.log("\n-- Skipped --");
        skipped.forEach((s) => console.log(`  [${s.reference}] ${s.reason}`));
        await mongoose.disconnect();
        console.log("\nDry run done. No emails sent.");
        process.exit(0);
    }

    // LIVE: send customer emails.
    let customerSent = 0, customerFailed = 0;
    for (const c of customerEmails) {
        try {
            await sendCustomerRefundEmail(c);
            customerSent++;
        } catch (e) {
            customerFailed++;
            console.error("Customer email failed:", c.reference, e.message);
        }
    }

    // LIVE: send reseller summary emails (skip system account).
    let resellerSent = 0, resellerFailed = 0;
    for (const a of resellerAgg.values()) {
        if (!a.user || a.user.isSystemAccount === true) continue;
        try {
            await sendResellerRefundNotice({
                to: a.user.email,
                resellerName: a.user.name,
                clawedBack: a.totalClawback,
                transactionsRefunded: a.count,
                payoutRejected: true, // payouts were paused/rejected as part of this
                availableBalance: money((a.user.totalCommissionEarned || 0) - (a.user.totalCommissionPaidOut || 0)),
            });
            resellerSent++;
        } catch (e) {
            resellerFailed++;
            console.error("Reseller email failed:", String(a.user._id), e.message);
        }
    }

    console.log("\n==== EMAIL CATCH-UP REPORT ====");
    console.log(`Customer emails sent:   ${customerSent}  (failed: ${customerFailed})`);
    console.log(`Reseller emails sent:   ${resellerSent}  (failed: ${resellerFailed})`);
    console.log(`Skipped (no email):     ${skipped.length}`);

    await mongoose.disconnect();
    console.log("\nDone.");
    process.exit(0);
}

main().catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
});