/*  
  Made By Yonzi
  Base : Lenwy
  WhatsApp : wa.me/62895428355980
  Youtube : @Keizi_Yo
  Mohon Untuk Tidak Menghapus Watermark Di Dalam Kode Ini
*/

// Import Module 
const { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require("baileys")
const pino = require("pino")
const chalk = require("chalk")
const readline = require("readline")
const { addWarning } = require("./warnings")

// Promt Input Terminal
async function question(promt) {
    process.stdout.write(promt)
    const r1 = readline.createInterface({ input: process.stdin, output: process.stdout })
    return new Promise((resolve) => r1.question("", (ans) => { r1.close(); resolve(ans) }))
}

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('./YonziSesi')
    const { version, isLatest } = await fetchLatestBaileysVersion()
    console.log(`Yonzi Using WA v${version.join('.')}, isLatest: ${isLatest}`)

    const Yonzi = makeWASocket({
        logger: pino({ level: "silent" }),
        printQRInTerminal: true,
        auth: state,
        browser: ['Ubuntu', 'Chrome', '20.0.04'],
        version: version,
        syncFullHistory: true,
        generateHighQualityLinkPreview: true
    })

    // Menyimpan Sesi Login
    Yonzi.ev.on("creds.update", saveCreds)

    // Info Koneksi
    Yonzi.ev.on("connection.update", (update) => {
        const { connection } = update
        if (connection === "close") {
            console.log(chalk.red("❌  Koneksi Terputus, Mencoba Menyambung Ulang"))
            connectToWhatsApp()
        } else if (connection === "open") {
            console.log(chalk.green("✔  Bot Berhasil Terhubung Ke WhatsApp"))
        }
    })

    // AUTO SALAM MEMBER MASUK/KELUAR
    Yonzi.ev.on("group-participants.update", async (update) => {
        const groupId = update.id
        for (const participant of update.participants) {
            if (update.action === "add") {
                await Yonzi.sendMessage(groupId, { text: `👋 Selamat datang @${participant.split("@")[0]}!`, mentions: [participant] })
            } else if (update.action === "remove") {
                await Yonzi.sendMessage(groupId, { text: `😢 @${participant.split("@")[0]} telah keluar.`, mentions: [participant] })
            }
        }
    })

    // PESAN MASUK
    Yonzi.ev.on("messages.upsert", async (m) => {
        const msg = m.messages[0]
        if (!msg.message || msg.key.fromMe) return

        const body = msg.message.conversation || msg.message.extendedTextMessage?.text || ""
        const sender = msg.key.remoteJid
        const pushname = msg.pushName || "Yonzi"

        // Log Pesan Masuk Terminal
        const listColor = ["red", "green", "yellow", "magenta", "cyan", "white", "blue"]
        const randomColor = listColor[Math.floor(Math.random() * listColor.length)]
        console.log(
            chalk.yellow.bold("Credit : Yonzi"),
            chalk.green.bold("[ WhatsApp ]"),
            chalk[randomColor](pushname),
            chalk[randomColor](" : "),
            chalk.white(body)
        )

        // CEK LINK + SISTEM WARNING + HAPUS PESAN
        const linkRegex = /\b(?:https?:\/\/|www\.)\S+|\b\S+\.(com|id|net|org|co|info|me|gg|io)(\/\S*)?\b/gi
        if (linkRegex.test(body) && sender.endsWith("@g.us")) {
            const participant = msg.key.participant // pengirim
            const warningCount = addWarning(participant)

            // Hapus pesan link
            await Yonzi.sendMessage(sender, { delete: msg.key })

            if (warningCount === 1) {
                await Yonzi.sendMessage(sender, {
                    text: `⚠️ @${participant.split("@")[0]} ini peringatan pertama! Jangan kirim link.`,
                    mentions: [participant]
                })
            } else if (warningCount === 2) {
                await Yonzi.sendMessage(sender, {
                    text: `⚠️ @${participant.split("@")[0]} peringatan kedua! Link tetap dilarang.`,
                    mentions: [participant]
                })
            } else if (warningCount >= 3) {
                // Hapus pesan terakhir sebelum kick
                await Yonzi.sendMessage(sender, { delete: msg.key })

                await Yonzi.sendMessage(sender, {
                    text: `🚫 @${participant.split("@")[0]} sudah 3x melanggar. Dikeluarkan dari grup.`,
                    mentions: [participant]
                })

                await Yonzi.groupParticipantsUpdate(sender, [participant], "remove")
                console.log(chalk.red(`🚫 ${pushname} dikeluarkan karena 3x mengirim link`))
            }
        }

        // Integrasi script tambahan
        try { require("./Yonzi")(Yonzi, m) } catch (e) { /* ignore */ }
    })
}

// Jalankan Bot
connectToWhatsApp()
