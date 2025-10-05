/*  

  Made By Yonzi
  Base : Lenwy
  WhatsApp : wa.me/62895428355980  
  Youtube : @Keizi_Yo

  Channel : https://whatsapp.com/channel/0029VaGdzBSGZNCmoTgN2K0u

  Copy Code?, Recode?, Rename?, Reupload?, Reseller? Taruh Credit Ya :D

  Mohon Untuk Tidak Menghapus Watermark Di Dalam Kode Ini

*/

// Import Module
require('./len')
require('./database/Menu/YonziMenu')
const fs = require('fs');
const axios = require('axios');

// Import Scrape
const Ai4Chat = require('./scrape/Ai4Chat');
const tiktok2 = require('./scrape/Tiktok');

module.exports = async (Yonzi, m) => {
    const msg = m.messages[0];
    if (!msg.message) return;

    const body = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
    const sender = msg.key.fromMe
        ? Yonzi.user.id.split(':')[0] + '@s.whatsapp.net'
        : msg.key.participant || msg.key.remoteJid;
    // END PERUBAHAN PENTING

    const pushname = msg.pushName || "Yonzi";
    const args = body.slice(1).trim().split(" ");
    const command = args.shift().toLowerCase();
    const q = args.join(" ");

    // PERBAIKAN 1: Gunakan global.prefix
    if (!body.startsWith(global.prefix)) return;
    // Panggil ulang 'sender' yang sudah diperbaiki
    const Yonzireply = (teks) => Yonzi.sendMessage(msg.key.remoteJid, { text: teks }, { quoted: msg });
    const isGroup = msg.key.remoteJid.endsWith('@g.us');
    // PERBAIKAN 2: Gunakan global.admin
    const isAdmin = (global.admin.includes(sender));
    const menuImage = fs.readFileSync(global.image);

    switch (command) {

        // Menu
        case "menu": {
            await Yonzi.sendMessage(msg.key.remoteJid,
                {
                    image: menuImage,
                    caption: Yonzimenu,
                    mentions: [sender]
                },
                { quoted: msg }
            )
        }
            break

        // Hanya Admin
        case "admin": {
            if (!isAdmin) return Yonzireply(mess.admin); // <-- Menggunakan isAdmin yang sudah mengecek global.admin
            Yonzireply("🎁 *Kamu Adalah Admin*");
        }
            break

        case "myjid": {
            // Tampilkan JID pengirim yang dideteksi oleh bot
            Yonzireply(`JID Anda: ${sender}\n\nFormat JID di len.js: ${global.admin[0]}\n\n isAdmin: ${isAdmin}`);
        }
            break

        // Hanya Group
        case "group": {
            if (!isGroup) return Yonzireply(mess.group); // Contoh Penerapan Hanya Group
            Yonzireply("🎁 *Kamu Sedang Berada Di Dalam Grup*"); // Pesan Ini Hanya Akan Dikirim Jika Di Dalam Grup
        }
            break

        // AI Chat
        case "yai": {
            if (!q) return Yonzireply(
                "🤖 Halo! Aku Yonzi AI, siap membantu menjawab pertanyaanmu.\n" +
                "Gunakan format: !yai [pertanyaan]\n" +
                "*Contoh:* !yai Apa itu JavaScript?"
            );
            Yonzireply(mess.wait);
            try {
                const lenai = await Ai4Chat(q);
                await Yonzireply(`*Yonzi AI*\n\n${lenai}`);
            } catch (error) {
                console.error("Error:", error);
                Yonzireply(mess.error);
            }
        }
            break;

        case "ttdl": {
            if (!q) return Yonzireply("⚠ *Mana Link Tiktoknya?*");
            Yonzireply(mess.wait);
            try {
                const result = await tiktok2(q); // Panggil Fungsi Scraper

                // Kirim Video
                await Yonzi.sendMessage(
                    msg.key.remoteJid, // ✅ PERBAIKAN: Menggunakan ID Grup/Chat
                    {
                        video: { url: result.no_watermark },
                        caption: `*🎁 Yonzi Tiktok Downloader*`
                    },
                    { quoted: msg }
                );

            } catch (error) {
                console.error("Error TikTok DL:", error);
                Yonzireply(mess.error);
            }
        }
            break;

        case "igdl": {
            if (!q) return Yonzireply("⚠ *Mana Link Instagramnya?*");
            try {
                Yonzireply(mess.wait);

                // Panggil API Velyn
                const apiUrl = `https://www.velyn.biz.id/api/downloader/instagram?url=${encodeURIComponent(q)}`;
                const response = await axios.get(apiUrl);

                if (!response.data.status || !response.data.data.url[0]) {
                    throw new Error("Link tidak valid atau API error");
                }

                const data = response.data.data;
                const mediaUrl = data.url[0];
                const metadata = data.metadata;

                // Kirim Media
                if (metadata.isVideo) {
                    await Yonzi.sendMessage(
                        msg.key.remoteJid, // ✅ PERBAIKAN: Menggunakan ID Grup/Chat
                        {
                            video: { url: mediaUrl },
                            caption: `*Instagram Reel*\n\n` +
                                `*Username :* ${metadata.username}\n` +
                                `*Likes :* ${metadata.like.toLocaleString()}\n` +
                                `*Comments :* ${metadata.comment.toLocaleString()}\n\n` +
                                `*Caption :* ${metadata.caption || '-'}\n\n` +
                                `*Source :* ${q}`
                        },
                        { quoted: msg }
                    );
                } else {
                    await Yonzi.sendMessage(
                        msg.key.remoteJid, // ✅ PERBAIKAN: Menggunakan ID Grup/Chat
                        {
                            image: { url: mediaUrl },
                            caption: `*Instagram Post*\n\n` +
                                `*Username :* ${metadata.username}\n` +
                                `*Likes :* ${metadata.like.toLocaleString()}\n\n` +
                                `*Caption :* ${metadata.caption || '-'}`
                        },
                        { quoted: msg }
                    );
                }

            } catch (error) {
                console.error("Error Instagram DL:", error);
                Yonzireply(mess.error);
            }
        }
            break;

        // Game Tebak Angka
        case "tebakangka": {
            const target = Math.floor(Math.random() * 100);
            Yonzi.tebakGame = { target, sender };
            Yonzireply("*Tebak Angka 1 - 100*\n*Ketik !tebak [Angka]*");
        }
            break;

        case "tebak": {
            if (!Yonzi.tebakGame || Yonzi.tebakGame.sender !== sender) return;
            const guess = parseInt(args[0]);
            if (isNaN(guess)) return Yonzireply("❌ *Masukkan Angka!*");

            if (guess === Yonzi.tebakGame.target) {
                Yonzireply(`🎉 *Tebakkan Kamu Benar!*`);
                delete Yonzi.tebakGame;
            } else {
                Yonzireply(guess > Yonzi.tebakGame.target ? "*Terlalu Tinggi!*" : "*Terlalu rendah!*");
            }
        }
            break;

        case "quote": {
            const quotes = [
                "Jangan menyerah, hari buruk akan berlalu.",
                "Kesempatan tidak datang dua kali.",
                "Kamu lebih kuat dari yang kamu kira.",
                "Hidup ini singkat, jangan sia-siakan.",
                "Kegagalan adalah awal dari kesuksesan. - Naruto (Naruto)",
                "Jangan menyerah, karena begitu kamu menyerah, game baru akan dimulai. - Hikigaya Hachiman (Oregairu)",
                "Tujuan yang lebih tinggi akan membuatmu mengatasi segala rintangan. - Athrun Zala (Mobile Suit Gundam SEED)",
                "Ketika kamu menyelesaikan sesuatu, itu bukanlah akhir dari sesuatu, itu adalah awal dari yang baru. - Taiga Aisaka (Toradora!)",
                "Hidup adalah permainan. Jika kamu berhenti, itu berarti kamu kalah. - School Rumble",
                "Jika kamu tidak menang sekarang, itu hanya berarti kamu akan menang nanti. - Kuroko Tetsuya (Kuroko no Basket)",
                "Teruslah berjalan maju. Bahkan jika langit runtuh, aku akan bangkit kembali. - Tengen Toppa Gurren Lagann",
                "Kalau semau kamu, semau kamu, dan kalau semau aku, jangan salahkan aku lagi. - Sawamura Eijun (Ace of Diamond)",
                "Meskipun masa lalu melukai, tetapi akan memudahkan langkahmu di masa depan. - Shizuku Edo (Fairy Tail)",
                "Kita mungkin tidak dapat mengubah dunia, tapi kita tidak akan pernah berhenti mencoba. - Lelouch Lamperouge (Code Geass)",
                "Kelemahan adalah gambaran dari kekuatan yang berbeda. - Uchiha Itachi (Naruto)",
                "Saat kamu jatuh, kamu menyadari ada banyak hal yang tidak kamu ketahui. - Akame (Akame ga Kill!)",
                "Kita mungkin tidak dapat memilih bagaimana kita mati, tapi kita bisa memutuskan bagaimana kita hidup. - Claymore",
                "Jangan pernah menyerah, bahkan ketika hidup terasa sulit. - Usui Takumi (Kaichou wa Maid-sama!)",
                "Akan selalu ada orang-orang yang menentangmu, tapi itu tidak berarti kamu harus menyerah. - One Piece",
                "Bagaimana pun, keputusan terbaik adalah yang diambil dengan keberanian. - Code Geass",
                "Jangan berhenti berjuang sampai kamu mendapatkan yang kamu inginkan. - Naruto (Naruto)",
                "Jangan pernah berhenti bermimpi, karena mimpi adalah awal dari segalanya. - Fairy Tail",
                "Hidup adalah perjuangan, tapi percaya diri adalah kuncinya. - Gintama",
                "Kau mungkin tidak bisa mengubah dunia hanya dengan senyum, tapi tidak ada yang berubah tanpa senyumanmu. - K-ON!",
                "Hidup adalah tentang belajar untuk bertahan, bahkan ketika kau terluka. - Naruto (Naruto)",
                "Jangan menyerah, karena itu adalah tempat yang aku mulai berjalan. - Natsu Dragneel (Fairy Tail)",
                "Terkadang, kau harus berhenti memikirkan hal-hal yang buruk, dan mulai berpikir tentang hal-hal yang baik. - Trunks (Dragon Ball Z)",
                "Ketika kau kehilangan sesuatu yang kau cintai, terasa seperti semesta hanya ingin memberimu hal yang lebih baik. - Riza Hawkeye (Fullmetal Alchemist)",
                "Jika kau terus menatap ke belakang, kau tidak akan bisa melihat yang ada di depanmu. - Monkey D. Luffy (One Piece)",
                "Jangan mengurungkan niatmu karena takut gagal. Keberanian itu adalah menghadapi ketakutanmu, bahkan ketika itu pahit. - Saber (Fate/Stay Night)",
                "Kekuatan sejati tak ada yang tahu berapa besar, sampai kau membutuhkannya untuk meraih impianmu. - Gon Freecss (Hunter x Hunter)",
                "Jangan menyesali masa lalu, jadikan itu sebagai pelajaran untuk hari ini. - Itachi Uchiha (Naruto)",
                "Kau tidak akan pernah tahu apa yang akan terjadi. Jadi, berusahlah untuk menemukan kebahagiaan di setiap momen. - Katsura Kotarou (Gintama)",
                "Memiliki kekuatan itu bukan berarti kau harus menjadi seseorang yang kuat. Kekuatanmu aman jika kau mampu melindungi orang yang kau cintai. - Tanjiro Kamado (Demon Slayer)",
                "Hidupmu adalah milikmu. Kamu harus menjalani hidupmu, biarlah orang lain mengomel sebanyak yang mereka mau. Itu tidak akan berarti apa-apa. - Nana Osaki (Nana)",
                "Semuanya dimulai saat kita memutuskan untuk mempercayai orang lain. - Oga Tatsumi (Beelzebub)",
                "Kadang-kadang, berusaha untuk menjadi lebih baik adalah yang terbaik yang bisa kita lakukan. - Shinichi Kudo (Detective Conan)",
                "Saat kita terlibat masalah, yang perlu kita lakukan hanyalah berpikir logis. Jika tidak ada solusi, berhenti berpikir masalah itu. - Edogawa Conan (Detective Conan)",
                "Kesenangan dan rasa sakit dalam hidup adalah dua sisi dari koin yang sama. Kamu tidak bisa merasakan satu tanpa yang lainnya. - Sasuke Uchiha (Naruto)",
                "Kau harus belajar hidup dengan menghargai setiap momen, karena tak ada yang bisa kembali ke masa lalu. - Erza Scarlet (Fairy Tail)",
                "Hidup adalah sebuah petualangan, dan setiap keputusanmu akan membawamu ke arah yang berbeda. - Eren Yeager (Attack on Titan)",
                "Ketika kau berani untuk bertindak, tak ada yang tidak mungkin. - Usopp (One Piece)",
                "Jangan menjadi seseorang yang menyesal, menjadi seseorang yang beruntung. - Ikki Kurogane (Rakudai Kishi no Eiyuutan)",
                "Realitas itu keras, tapi tidak peduli seberapa menyakitinya, jangan pernah menyerah pada kehidupan. - Natsuki Subaru (Re:Zero)",
                "Kegagalan adalah jalan menuju keberhasilan. - Itachi Uchiha (Naruto)",
                "Tanpa adanya kegelapan, kita tidak akan bisa melihat bintang-bintang. - Makishima Shougo (Psycho-Pass)",
                "Tidak ada hal yang tidak mungkin, yang ada hanyalah hal yang belum dicoba. - Vash the Stampede (Trigun)",
                "Bagi mereka yang percaya pada impian, kehidupan memiliki arti yang lebih besar. - Natsu Dragneel (Fairy Tail)",
                "Jangan menyerah, karena ketika kamu menyerah, permainan baru saja dimulai. - Eren Yeager (Attack on Titan)",
                "Keuletan merupakan kunci untuk meraih impian. - Yami Yugi (Yu-Gi-Oh!)",
                "Orang yang tidak mengerti rasa sakit tidak akan pernah mengerti kebahagiaan sejati. - Pain (Naruto)",
                "Setiap kegagalan adalah langkah menuju kesuksesan. - Lelouch Lamperouge (Code Geass)",
                "Jangan pernah menyerah, karena saat kamu menyerah, itulah akhir dari impianmu. - Sailor Moon",
                "Ketika kamu merasa lelah, ingatlah mengapa kamu memulai semuanya. - Nana Osaki (Nana)",
                "Kehidupan tidak harus selalu menyenangkan, tapi itu harus diperjuangkan. - Kousei Arima (Your Lie in April)",
                "Jangan takut pada kegagalan, tapi takutlah pada ketidakberanian untuk mencoba. - Gintoki Sakata (Gintama)",
                "Hidup adalah perjalanan, dan kita harus melaluinya dengan penuh semangat. - Gon Freecs (Hunter x Hunter)",
                "Kadang-kadang kekuatan sejati bukanlah tentang seberapa kuat kamu, tapi seberapa kuat tekadmu. - Roronoa Zoro (One Piece)",
                "Jangan biarkan masa lalu menghentikan langkahmu ke depan. - Jiraiya (Naruto)",
                "Ketika kamu merasa lelah, istirahatlah, tapi jangan menyerah. - Koro-sensei (Assassination Classroom)",
                "Ketika kamu merasa putus asa, ingatlah betapa jauhnya kamu sudah sampai sejauh ini. - Ryuko Matoi (Kill la Kill)",
                "Kita tidak dapat hidup tanpa yang lainnya. Itulah sebabnya kita harus saling mendukung. - Taiga Aisaka (Toradora!)",
                "Jangan pernah berhenti berjuang, karena itulah yang membuatmu menjadi lebih kuat. - Natsu Dragneel (Fairy Tail)",
                "Setiap orang memiliki masa lalu yang menyakitkan, tapi itu bukanlah alasan untuk menyerah pada masa depan. - Itachi Uchiha (Naruto)",
                "Cinta itu membuatku menjadi lebih kuat. - Natsu Dragneel (Fairy Tail)",
                "Aku jatuh cinta padamu, bukan karena kelebihanmu, tapi karena kelemahanmu. - Chihiro Furuya (Sankarea)",
                "Mungkin jika kita terus bersama, suatu hari aku akan menyukaimu. - Taiga Aisaka (Toradora!)",
                "Aku bahagia hanya dengan melihat senyummu. - Kou Mabuchi (Ao Haru Ride)",
                "Aku bersedia bersamamu, meskipun hidup kita penuh dengan penderitaan. - Holo (Spice and Wolf)",
                "Cinta itu seperti angin, tidak bisa kulihat, tapi bisa kurasakan. - Mikan Sakura (Gakuen Alice)",
                "Ketika aku bersamamu, rasanya seperti dunia ini milikku. - Yui (Oregairu)",
                "Aku akan menunggumu, meski butuh seribu tahun. - Asuna (Sword Art Online)",
                "Cinta sejati takkan pernah bisa dipisahkan oleh jarak. - Naruto Uzumaki (Naruto)",
                "Aku akan selalu berada di sampingmu, meski dunia menentang kita. - Tomoya Okazaki (Clannad)",
                "Jangan pernah menyerah sampai hari yang kamu impikan menjadi kenyataan. - Natsu Dragneel (Fairy Tail)",
                "Jika kamu tidak punya keberanian untuk memulai, kamu juga tidak akan memiliki keberanian untuk menyelesaikannya. - Sawamura Eijun (Diamond no Ace)",
                "Tidak ada jalan pintas menuju kesuksesan. Tidak peduli seberapa keras kamu berusaha, hasilnya akan sepadan dengan usahamu. - Edward Elric (Fullmetal Alchemist)",
                "Ketika kamu merasa putus asa, ingatlah bahwa sekarang bukanlah akhir dari segalanya. Semua akan baik-baik saja. - Kuroko Tetsuya (Kuroko no Basket)",
                "Berhenti berharap hasil yang sempurna. Keberanianmu untuk mencoba adalah yang paling berharga. - Erza Scarlet (Fairy Tail)",
                "Sesuatu yang penting tidak akan pernah datang dengan mudah. Kita harus berjuang dan berusaha untuk mendapatkannya. - Monkey D. Luffy (One Piece)",
                "Jangan biarkan masa lalu mempengaruhi masa depanmu. Langkahlah maju dengan keberanian. - Naruto Uzumaki (Naruto)",
                "Tidak ada kekacauan yang tak bisa diatasi. Teruslah bergerak maju dan temukan jalan keluarnya. - Rintarou Okabe (Steins;Gate)",
                "Setiap kegagalan adalah langkah menuju kesuksesan. Jangan menyerah begitu saja. - Jotaro Kujo (JoJo's Bizarre Adventure)",
                "Hidupmu sesungguhnya adalah milikmu sendiri. Jangan biarkan orang lain yang mengendalikannya. - Eren Yeager (Attack on Titan)"
            ];
            const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
            Yonzireply(`*Quote Hari Ini :*\n_"${randomQuote}"_`);
        }
            break;

        case "orang-paling-bot": {
            const bot = [
                "Yonas, Yonas adalah orang paling bot, gey, payah, pazzo, dan hati-hati dia suka cium pantat kalian"
            ];

            const reply = bot[Math.floor(Math.random() * bot.length)];

            // Gunakan Yonzireply biar bot bisa kirim pesan
            Yonzireply(reply);

            break;
        }
        case "orang-gila": {
            const bot = [
                "Yonas, Yonas adalah orang paling gila, saking gilanya dia bakal cium pantat kalian"
            ];

            const reply = bot[Math.floor(Math.random() * bot.length)];

            // Gunakan Yonzireply biar bot bisa kirim pesan
            Yonzireply(reply);

            break;
        }
        case "geylist": {
            const geyList = [
                "1. Yonas",
                "2. Rafa"
            ];

            const reply = geyList.join("\n");

            Yonzireply(`*Gey List:*\n${reply}`);

            break;
        }

        case "hehe": {
            const bot = [
                "yang baca fix gey"
            ];

            const reply = bot[Math.floor(Math.random() * bot.length)];

            // Gunakan Yonzireply biar bot bisa kirim pesan
            Yonzireply(reply);

            break;
        }
        case "h": {
            if (!isAdmin) return Yonzireply(global.mess.admin);
            if (!isGroup) return Yonzireply("Hanya bisa di grup!");
            if (!q) return Yonzireply("⚠ Masukkan teks, contoh: !h apa kabar semua");

            // Gunakan ID Grup untuk mendapatkan metadata partisipan
            let groupMetadata = await Yonzi.groupMetadata(msg.key.remoteJid);
            let participants = groupMetadata.participants.map(a => a.id);

            // GANTI INI:
            // await Yonzi.sendMessage(msg.key.remoteJid, { 
            // MENJADI INI: Gunakan msg.key.remoteJid (ID Grup) sebagai tujuan
            await Yonzi.sendMessage(msg.key.remoteJid, {
                text: q,
                mentions: participants
            }, { quoted: msg });
        }
            break;

        case "all": {
            // 1. Pengecekan HANYA di PC:
            // Gunakan 'isGroup' yang sudah didefinisikan di awal file.
            if (isGroup) {
                return Yonzireply("⚠ *Perintah ini hanya bisa digunakan di Chat Pribadi (PC) bot.*");
            }

            // 2. Pengecekan HANYA untuk ID SPESIFIK ANDA (Fleksibel JID):
            // Kita gunakan kedua JID Anda agar bot mengenali Anda di format manapun.
            const YOUR_JIDS = [
                '6289512637814@s.whatsapp.net', // JID standar (terdeteksi di PC)
                '238542617862381@lid'           // JID bisnis (terdeteksi di Grup, tapi jaga-jaga)
            ];

            // Pengecekan: Jika sender BUKAN salah satu dari JID yang spesifik
            if (!YOUR_JIDS.includes(sender)) {
                return Yonzireply(global.mess.admin);
            }

            if (!q) return Yonzireply("⚠ Masukkan pesan, contoh: !all Hai semua grup!");

            // --- LOGIKA BROADCAST DIMULAI ---
            Yonzireply(global.mess.wait); // Tampilkan pesan tunggu

            try {
                // Ambil semua grup yang bot gabung
                const groups = await Yonzi.groupFetchAllParticipating();
                const groupIds = Object.keys(groups);

                let successCount = 0;

                for (let id of groupIds) {
                    // Ambil metadata grup untuk menandai semua member
                    const groupMetadata = await Yonzi.groupMetadata(id);
                    const participants = groupMetadata.participants.map(p => p.id);

                    // Kirim pesan sekaligus tag semua member
                    await Yonzi.sendMessage(id, {
                        text: q,
                        mentions: participants
                    });

                    successCount++;

                    // Delay supaya tidak spam
                    await new Promise(resolve => setTimeout(resolve, 500));
                }

                Yonzireply(`✅ Pesan berhasil dikirim ke ${successCount} grup dan semua anggota ditandai.`);
            } catch (err) {
                console.error("Error broadcast all:", err);
                Yonzireply("⚠ Terjadi kesalahan saat mengirim pesan ke semua grup.");
            }
        }
            break;

        // Command Sewa Bot
        case "sew": {
            if (!q) {
                return Yonzireply("❌ *Format Salah!*\n\nContoh Penggunaan:\n!sew bot");
            }

            if (q.toLowerCase() === "bot") {
                // Pesan sewa bot
                const rentMessage =
                    "Yonzi belum menyediakan layanan sewa bot saat ini. Silakan hubungi admin untuk informasi lebih lanjut.";

                /* "🤖 *Info Sewa Bot Yonzi*\n\n" +
                 "Hai! Terima kasih telah tertarik untuk menyewa *Bot Yonzi*.\n" +
                 "Bot ini siap membantu mengelola grup Anda 24/7 dengan berbagai fitur keren.\n\n" +
                 "📞 *Kontak Admin untuk info harga & fitur:*\n" +
                 "+62 895-4283-55980 _(Ketuk untuk chat)_\n\n" +
                 "Terima kasih telah mempercayai Bot Yonzi! ✨"; */
                Yonzireply(rentMessage);
            } else {
                // Pesan default kalau input selain "bot"
                Yonzireply(
                    "⚠ *Daftar Command Sewa yang Tersedia:*\n" +
                    "- !sew bot\n\n" +
                    "_Masukkan salah satu command di atas untuk melihat detail sewa._"
                );
            }
        }
            break;

        default: { Yonzireply(mess.default) }
    }
}