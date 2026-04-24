// Track: toeic — TOEIC Elementary Emails (Band 255 – 495)

export const TOEIC_ELEMENTARY_EMAILS_LESSON = {
  id: "toeic-elementary-emails",
  title: "TOEIC Elementary Emails",
  description: "Đọc và viết email công sở đơn giản: yêu cầu, thông báo, đính kèm",
  level: "beginner",
  icon: "📧",
  examTag: "toeic",
  toeicBand: "255-495",
  vocabulary: [
    { word: "Dear",         phonetic: "/dɪər/",         meaning: "Kính gửi",         example: "Dear Mr. Smith,",                                  illustration: "✉️" },
    { word: "Regards",      phonetic: "/rɪˈɡɑːdz/",     meaning: "Trân trọng",       example: "Best regards, Linh.",                               illustration: "🙋" },
    { word: "Attach",       phonetic: "/əˈtætʃ/",       meaning: "Đính kèm",         example: "I attach the report for your review.",              illustration: "📎" },
    { word: "Attachment",   phonetic: "/əˈtætʃmənt/",   meaning: "Tệp đính kèm",     example: "Please open the attachment.",                       illustration: "📎" },
    { word: "Reply",        phonetic: "/rɪˈplaɪ/",      meaning: "Trả lời",          example: "I will reply by tomorrow.",                         illustration: "↩️" },
    { word: "Forward",      phonetic: "/ˈfɔːwəd/",      meaning: "Chuyển tiếp",      example: "Please forward this email to your team.",           illustration: "➡️" },
    { word: "Subject",      phonetic: "/ˈsʌbdʒɪkt/",    meaning: "Chủ đề email",     example: "The subject line should be clear.",                 illustration: "🏷️" },
    { word: "Sincerely",    phonetic: "/sɪnˈsɪəli/",    meaning: "Chân thành",       example: "Yours sincerely, Minh.",                            illustration: "✍️" },
    { word: "Notify",       phonetic: "/ˈnəʊtɪfaɪ/",    meaning: "Thông báo",        example: "Please notify me of any changes.",                  illustration: "🔔" },
    { word: "Deadline",     phonetic: "/ˈdedlaɪn/",     meaning: "Hạn chót",         example: "The deadline is Friday.",                           illustration: "⏳" },
    { word: "Request",      phonetic: "/rɪˈkwest/",     meaning: "Yêu cầu",          example: "I have a small request.",                           illustration: "📝" },
    { word: "Urgent",       phonetic: "/ˈɜːdʒənt/",     meaning: "Khẩn cấp",         example: "This is an urgent matter.",                         illustration: "🚨" },
  ],
  grammar: [
    {
      title: "Cấu trúc email cơ bản",
      explanation: "Chào hỏi (Dear…) → Thân bài (I am writing to / Please find attached) → Kết thúc (Best regards / Sincerely).",
      examples: [
        { en: "Dear Ms. Lan, I am writing to confirm our meeting.",  vi: "Kính gửi cô Lan, tôi viết thư để xác nhận cuộc họp." },
        { en: "Please find the report attached.",                     vi: "Vui lòng xem báo cáo đính kèm." },
        { en: "Best regards, Nam.",                                    vi: "Trân trọng, Nam." },
      ],
    },
    {
      title: "Động từ khuyết (modals) trong email lịch sự",
      explanation: "could, would, may → tăng mức độ lịch sự so với can, will.",
      examples: [
        { en: "Could you please send the file by Friday?",            vi: "Bạn có thể gửi tệp trước thứ Sáu không?" },
        { en: "I would appreciate a quick reply.",                     vi: "Tôi rất biết ơn nếu bạn hồi âm sớm." },
        { en: "May I ask a question?",                                 vi: "Tôi có thể hỏi một câu được không?" },
      ],
    },
  ],
  quiz: [
    { question: "Mở đầu email chuẩn là:",                                options: ["Hi dude,", "Dear Mr. Smith,", "Yo!", "Hey man,"],         correct: 1 },
    { question: "\"Please find the report ___.\" (đính kèm)",             options: ["reply", "attached", "notify", "forward"],                correct: 1 },
    { question: "\"The ___ is Friday.\" (hạn chót)",                      options: ["subject", "deadline", "regards", "request"],            correct: 1 },
    { question: "Kết email lịch sự trang trọng nhất:",                   options: ["Bye!", "See ya!", "Best regards,", "Cheers,"],           correct: 2 },
    { question: "\"Please ___ this email to your team.\" (chuyển tiếp)",   options: ["reply", "forward", "attach", "notify"],                  correct: 1 },
    { question: "\"This is an ___ matter.\" (khẩn)",                      options: ["urgent", "request", "subject", "reply"],                 correct: 0 },
  ],
};

export default TOEIC_ELEMENTARY_EMAILS_LESSON;
