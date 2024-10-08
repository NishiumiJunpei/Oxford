//https://cloud.google.com/text-to-speech/docs/voices?hl=ja
//AU, GBは微妙なのでペンディング。例えば、Miaをえむあいえーと発音する。
export const speakerInfo = {
  male: [
    // { imageUrl: "/images/male4.png", voice: {languageCode: 'en-GB', name: "en-GB-Neural2-B"} },
    // { imageUrl: "/images/male5.png", voice: {languageCode: 'en-GB', name: "en-GB-Neural2-D"} },
    // { imageUrl: "/images/male6.png", voice: {languageCode: 'en-GB', name: "en-GB-News-J"} },
    // { imageUrl: "/images/male7.png", voice: {languageCode: 'en-GB', name: "en-GB-News-K"} },
    // { imageUrl: "/images/male8.png", voice: {languageCode: 'en-GB', name: "en-GB-News-L"} },
    // { imageUrl: "/images/male9.png", voice: {languageCode: 'en-GB', name: "en-GB-News-M"} },
    // { imageUrl: "/images/male10.png", voice: {languageCode: 'en-GB', name: "en-GB-Standard-B"} },
    // { imageUrl: "/images/male11.png", voice: {languageCode: 'en-GB', name: "en-GB-Standard-D"} },
    { imageUrl: "/images/male1.png", voice: {languageCode: 'en-US', name: "en-US-Casual-K"} },
    { imageUrl: "/images/male2.png", voice: {languageCode: 'en-US', name: "en-US-Casual-K"} },
    { imageUrl: "/images/male3.png", voice: {languageCode: 'en-US', name: "en-US-Casual-K"} },
    { imageUrl: "/images/male4.png", voice: {languageCode: 'en-US', name: "en-US-Polyglot-1"} },
    { imageUrl: "/images/male5.png", voice: {languageCode: 'en-US', name: "en-US-Neural2-A"} },
    { imageUrl: "/images/male6.png", voice: {languageCode: 'en-US', name: "en-US-Neural2-D"} },
    { imageUrl: "/images/male7.png", voice: {languageCode: 'en-US', name: "en-US-Neural2-I"} },
    { imageUrl: "/images/male8.png", voice: {languageCode: 'en-US', name: "en-US-Neural2-J"} },
    { imageUrl: "/images/male9.png", voice: {languageCode: 'en-US', name: "en-US-News-N"} , host: true },
    { imageUrl: "/images/male10.png", voice: {languageCode: 'en-US', name: "en-US-Standard-A"} },
    { imageUrl: "/images/male11.png", voice: {languageCode: 'en-US', name: "en-US-Neural2-D"} },
    { imageUrl: "/images/male12.png", voice: {languageCode: 'en-US', name: "en-US-Casual-K"}},
    { imageUrl: "/images/male13.png", voice: {languageCode: 'en-US', name: "en-US-Casual-K"} },
    { imageUrl: "/images/male14.png", voice: {languageCode: 'en-US', name: "en-US-Polyglot-1"} },
    { imageUrl: "/images/male15.png", voice: {languageCode: 'en-US', name: "en-US-Neural2-A"} },
    { imageUrl: "/images/male16.png", voice: {languageCode: 'en-US', name: "en-US-Neural2-D"} },
    { imageUrl: "/images/male17.png", voice: {languageCode: 'en-US', name: "en-US-Neural2-I"} },
    { imageUrl: "/images/male18.png", voice: {languageCode: 'en-US', name: "en-US-Neural2-J"} },
    { imageUrl: "/images/male19.png", voice: {languageCode: 'en-US', name: "en-US-News-N"} },
    { imageUrl: "/images/male20.png", voice: {languageCode: 'en-US', name: "en-US-Standard-A"} }
  ],
  female: [
    // { imageUrl: "/images/female4.png", voice: {languageCode: 'en-GB', name: "en-GB-Neural2-A"} },
    // { imageUrl: "/images/female5.png", voice: {languageCode: 'en-GB', name: "en-GB-Neural2-C"} },
    // { imageUrl: "/images/female6.png", voice: {languageCode: 'en-GB', name: "en-GB-Neural2-F"} },
    // { imageUrl: "/images/female7.png", voice: {languageCode: 'en-GB', name: "en-GB-News-G"} },
    // { imageUrl: "/images/female8.png", voice: {languageCode: 'en-GB', name: "en-GB-News-H"} },
    // { imageUrl: "/images/female9.png", voice: {languageCode: 'en-GB', name: "en-GB-News-I"} },
    // { imageUrl: "/images/female10.png", voice: {languageCode: 'en-GB', name: "en-GB-Standard-A"} },
    // { imageUrl: "/images/female11.png", voice: {languageCode: 'en-GB', name: "en-GB-Standard-C"} },
    { imageUrl: "/images/female1.png", voice: {languageCode: 'en-US', name: "en-US-Neural2-F"} },
    { imageUrl: "/images/female2.png", voice: {languageCode: 'en-US', name: "en-US-Neural2-C"} },
    { imageUrl: "/images/female3.png", voice: {languageCode: 'en-US', name: "en-US-Neural2-E"} },
    { imageUrl: "/images/female4.png", voice: {languageCode: 'en-US', name: "en-US-Neural2-F"} },
    { imageUrl: "/images/female5.png", voice: {languageCode: 'en-US', name: "en-US-Neural2-G"} },
    { imageUrl: "/images/female6.png", voice: {languageCode: 'en-US', name: "en-US-Neural2-G"} },
    { imageUrl: "/images/female7.png", voice: {languageCode: 'en-US', name: "en-US-News-K"} },
    { imageUrl: "/images/female8.png", voice: {languageCode: 'en-US', name: "en-US-News-L"} },
    { imageUrl: "/images/female9.png", voice: {languageCode: 'en-US', name: "en-US-Standard-C"} },
    { imageUrl: "/images/female10.png", voice: {languageCode: 'en-US', name: "en-US-Standard-E"}, host: true },
    { imageUrl: "/images/female11.png", voice: {languageCode: 'en-US', name: "en-US-Standard-E"} },
    { imageUrl: "/images/female12.png", voice: {languageCode: 'en-US', name: "en-US-Neural2-C"} },
    { imageUrl: "/images/female13.png", voice: {languageCode: 'en-US', name: "en-US-Neural2-E"} },
    { imageUrl: "/images/female14.png", voice: {languageCode: 'en-US', name: "en-US-Neural2-F"} },
    { imageUrl: "/images/female15.png", voice: {languageCode: 'en-US', name: "en-US-Neural2-G"} },
    { imageUrl: "/images/female16.png", voice: {languageCode: 'en-US', name: "en-US-Neural2-G"} },
    { imageUrl: "/images/female17.png", voice: {languageCode: 'en-US', name: "en-US-News-K"} },
    { imageUrl: "/images/female18.png", voice: {languageCode: 'en-US', name: "en-US-News-L"} },
    { imageUrl: "/images/female19.png", voice: {languageCode: 'en-US', name: "en-US-Standard-C"} },
    { imageUrl: "/images/female20.png", voice: {languageCode: 'en-US', name: "en-US-Standard-E"} }
  ]
};



export const challengeThemes = [
    { id: 11, name: 'TOEIC 900レベル', imageFilename: 'TOEIC900.png', activeStatus: 'ACTIVE' },
    { id: 12, name: 'TOEIC 800レベル', imageFilename: 'TOEIC800.png', activeStatus: 'ACTIVE' },
    { id: 13, name: 'TOEIC 700レベル', imageFilename: 'TOEIC700.png', activeStatus: 'ACTIVE' },
    { id: 14, name: 'TOEIC 600レベル', imageFilename: 'TOEIC600.png', activeStatus: 'ACTIVE' },
    { id: 8, name: '英検１級', imageFilename: 'eiken1.png', activeStatus: 'ACTIVE' },
    { id: 2, name: '英検準１級', imageFilename: 'eiken1-sub.png', activeStatus: 'ACTIVE' },
    { id: 5, name: '英検２級', imageFilename: 'eiken2.png', activeStatus: 'ACTIVE' },
    { id: 6, name: '英検準２級', imageFilename: 'eiken2-sub.png', activeStatus: 'ACTIVE' },
    { id: 7, name: '英検３級', imageFilename: 'eiken3.png', activeStatus: 'ACTIVE' },
    { id: 4, name: '英検４級', imageFilename: 'eiken4.png', activeStatus: 'ACTIVE' },
    { id: 96, name: 'ビジネス英語 基礎', imageFilename: 'business-english1.png', activeStatus: 'PREPARING' },
    { id: 95, name: 'ビジネス英語 中級', imageFilename: 'business-english2.png', activeStatus: 'PREPARING' },
    { id: 94, name: 'ビジネス英語 上級', imageFilename: 'business-english3.png', activeStatus: 'PREPARING' },
  ];


export const srTiming = [
  10,           //10分後
  60 * 5,       //5時間後
  60 * 24,      //24時間後 (1日)
  60 * 24 * 3,  //3日後
  60 * 24 * 7,  //7日後
  60 * 24 * 14,  //14日後
  60 * 24 * 30,  //30日後
]

export const badgeImages = [
  '/icon/blank.png',
  '/icon/smile.png',
  '/icon/like.png',
  '/icon/star2.png',
  '/icon/medal.png',
  '/icon/diamond.png',  
]


