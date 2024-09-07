
export function calculateAge(birthday) {
    // birthdayが空白の場合、20歳を返す
    if (!birthday) {
      return 20;
    }
  
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
  
    // 今年の誕生日がまだ来ていなければ、年齢から1を引く
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
  
    return age;
}


export function calculateElementarySchoolGrade(birthday) {
  if (!birthday) {
    // 誕生日が提供されていない場合、デフォルト値を返す
    return null;
  }

  const birthDate = new Date(birthday);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  // 今年の誕生日がまだ来ていなければ、年齢から1を引く
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  // 日本の教育システムに基づいて、6歳で小学1年生になる
  const grade = age - 6;

  // 小学生の範囲外の年齢の場合
  if (grade < 1 || grade > 6) {
    return null;
  }

  return `grade${grade}`;
}




export const getKanjiFromBirthday = (birthday) => {

  const grade = calculateElementarySchoolGrade(birthday)

  // gradeがnullの場合は空の配列を返す
  if (!grade) {
    return [];
  }


  //https://www.mext.go.jp/a_menu/shotou/new-cs/youryou/syo/koku/001.htm
  const kanjiByGrade = {
    grade1: "一,右,雨,円,王,音,下,火,花,貝,学,気,九,休,玉,金,空,月,犬,見,五,口,校,左,三,山,子,四,糸,字,耳,七,車,手,十,出,女,小,上,森,人,水,正,生,青,夕,石,赤,千,川,先,早,草,足,村,大,男,竹,中,虫,町,天,田,土,二,日,入,年,白,八,百,文,木,本,名,目,立,力,林,六",
    grade2: "引,羽,雲,園,遠,何,科,夏,家,歌,画,回,会,海,絵,外,角,楽,活,間,丸,岩,顔,汽,記,帰,弓,牛,魚,京,強,教,近,兄,形,計,元,言,原,戸,古,午,後,語,工,公,広,交,光,考,行,高,黄,合,谷,国,黒,今,才,細,作,算,止,市,矢,姉,思,紙,寺,自,時,室,社,弱,首,秋,週,春,書,少,場,色,食,心,新,親,図,数,西,声,星,晴,切,雪,船,線,前,組,走,多,太,体,台,地,池,知,茶,昼,長,鳥,朝,直,通,弟,店,点,電,刀,冬,当,東,答,頭,同,道,読,内,南,肉,馬,売,買,麦,半,番,父,風,分,聞,米,歩,母,方,北,毎,妹,万,明,鳴,毛,門,夜,野,友,用,曜,来,里,理,話",
    grade3: "悪,安,暗,医,委,意,育,員,院,飲,運,泳,駅,央,横,屋,温,化,荷,界,開,階,寒,感,漢,館,岸,起,期,客,究,急,級,宮,球,去,橋,業,曲,局,銀,区,苦,具,君,係,軽,血,決,研,県,庫,湖,向,幸,港,号,根,祭,皿,仕,死,使,始,指,歯,詩,次,事,持,式,実,写,者,主,守,取,酒,受,州,拾,終,習,集,住,重,宿,所,暑,助,昭,消,商,章,勝,乗,植,申,身,神,真,深,進,世,整,昔,全,相,送,想,息,速,族,他,打,対,待,代,第,題,炭,短,談,着,注,柱,丁,帳,調,追,定,庭,笛,鉄,転,都,度,投,豆,島,湯,登,等,動,童,農,波,配,倍,箱,畑,発,反,坂,板,皮,悲,美,鼻,筆,氷,表,秒,病,品,負,部,服,福,物,平,返,勉,放,味,命,面,問,役,薬,由,油,有,遊,予,羊,洋,葉,陽,様,落,流,旅,両,緑,礼,列,練,路,和",
    grade4: "愛,案,以,衣,位,囲,胃,印,英,栄,塩,億,加,果,貨,課,芽,改,械,害,街,各,覚,完,官,管,関,観,願,希,季,紀,喜,旗,器,機,議,求,泣,救,給,挙,漁,共,協,鏡,競,極,訓,軍,郡,径,型,景,芸,欠,結,建,健,験,固,功,好,候,航,康,告,差,菜,最,材,昨,札,刷,殺,察,参,産,散,残,士,氏,史,司,試,児,治,辞,失,借,種,周,祝,順,初,松,笑,唱,焼,象,照,賞,臣,信,成,省,清,静,席,積,折,節,説,浅,戦,選,然,争,倉,巣,束,側,続,卒,孫,帯,隊,達,単,置,仲,貯,兆,腸,低,底,停,的,典,伝,徒,努,灯,堂,働,特,得,毒,熱,念,敗,梅,博,飯,飛,費,必,票,標,不,夫,付,府,副,粉,兵,別,辺,変,便,包,法,望,牧,末,満,未,脈,民,無,約,勇,要,養,浴,利,陸,良,料,量,輪,類,令,冷,例,歴,連,老,労,録",
    grade5: "圧,移,因,永,営,衛,易,益,液,演,応,往,桜,恩,可,仮,価,河,過,賀,快,解,格,確,額,刊,幹,慣,眼,基,寄,規,技,義,逆,久,旧,居,許,境,均,禁,句,群,経,潔,件,券,険,検,限,現,減,故,個,護,効,厚,耕,鉱,構,興,講,混,査,再,災,妻,採,際,在,財,罪,雑,酸,賛,支,志,枝,師,資,飼,示,似,識,質,舎,謝,授,修,述,術,準,序,招,承,証,条,状,常,情,織,職,制,性,政,勢,精,製,税,責,績,接,設,舌,絶,銭,祖,素,総,造,像,増,則,測,属,率,損,退,貸,態,団,断,築,張,提,程,適,敵,統,銅,導,徳,独,任,燃,能,破,犯,判,版,比,肥,非,備,俵,評,貧,布,婦,富,武,復,複,仏,編,弁,保,墓,報,豊,防,貿,暴,務,夢,迷,綿,輸,余,預,容,略,留,領",
    grade6: "異,遺,域,宇,映,延,沿,我,灰,拡,革,閣,割,株,干,巻,看,簡,危,机,揮,貴,疑,吸,供,胸,郷,勤,筋,系,敬,警,劇,激,穴,絹,権,憲,源,厳,己,呼,誤,后,孝,皇,紅,降,鋼,刻,穀,骨,困,砂,座,済,裁,策,冊,蚕,至,私,姿,視,詞,誌,磁,射,捨,尺,若,樹,収,宗,就,衆,従,縦,縮,熟,純,処,署,諸,除,将,傷,障,城,蒸,針,仁,垂,推,寸,盛,聖,誠,宣,専,泉,洗,染,善,奏,窓,創,装,層,操,蔵,臓,存,尊,宅,担,探,誕,段,暖,値,宙,忠,著,庁,頂,潮,賃,痛,展,討,党,糖,届,難,乳,認,納,脳,派,拝,背,肺,俳,班,晩,否,批,秘,腹,奮,並,陛,閉,片,補,暮,宝,訪,亡,忘,棒,枚,幕,密,盟,模,訳,郵,優,幼,欲,翌,乱,卵,覧,裏,律,臨,朗,論"
  };


  let kanjiArray = [];
  for (let i = 1; i <= parseInt(grade.slice(-1)); i++) {
    kanjiArray = kanjiArray.concat(kanjiByGrade[`grade${i}`].split(','));
  }

  return kanjiArray;
}


export const timeAgo = (date) => {
  const now = new Date();
  const compareDate = new Date(date);
  let differenceInTime = compareDate.getTime() - now.getTime();

  // 未来の日付の場合
  if (differenceInTime > 0) {
    const differenceInDays = Math.floor(differenceInTime / (1000 * 3600 * 24));
    const differenceInHours = Math.floor(differenceInTime / (1000 * 3600));
    const differenceInMinutes = Math.floor(differenceInTime / (1000 * 60));

    if (differenceInDays > 0) {
      return `${differenceInDays}日後`;
    } else if (differenceInHours > 0) {
      return `${differenceInHours}時間後`;
    } else if (differenceInMinutes > 0) {
      return `${differenceInMinutes}分後`;
    } else {
      return '数分後';
    }
  }

  // 過去の日付の場合
  differenceInTime = Math.abs(differenceInTime);
  const differenceInDays = Math.floor(differenceInTime / (1000 * 3600 * 24));
  const differenceInHours = Math.floor(differenceInTime / (1000 * 3600));
  const differenceInMinutes = Math.floor(differenceInTime / (1000 * 60));

  if (differenceInDays > 0) {
    return `${differenceInDays}日前`;
  } else if (differenceInHours > 0) {
    return `${differenceInHours}時間前`;
  } else if (differenceInMinutes > 0) {
    return `${differenceInMinutes}分前`;
  } else {
    return '数分前';
  }
};

export const getTimeDifferenceText = (lastUpdatedAt) => {
  const currentTime = new Date();
  const lastUpdatedTime = new Date(lastUpdatedAt);
  const timeDifference = currentTime - lastUpdatedTime;

  const minutesDifference = Math.floor(timeDifference / (1000 * 60));
  const hoursDifference = Math.floor(timeDifference / (1000 * 60 * 60));
  const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

  let timeDifferenceText;
  if (daysDifference > 0) {
    timeDifferenceText = `${daysDifference}日前`;
  } else if (hoursDifference > 0) {
    timeDifferenceText = `${hoursDifference}時間前`;
  } else if (minutesDifference > 0) {
    timeDifferenceText = `${minutesDifference}分前`;
  } else {
    timeDifferenceText = `さきほど`;
  }

  return lastUpdatedAt ? `${timeDifferenceText}（${lastUpdatedTime.getFullYear()}年${lastUpdatedTime.getMonth() + 1}月${lastUpdatedTime.getDate()}日）` : '';
};

export const isWithinDays = (date, days) => {
  if (!date) return false;

  const now = new Date();
  const targetDate = new Date(date);
  const timeDifference = now - targetDate;
  const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

  return daysDifference <= days;
};




// 配列をランダムに並び替える関数
export function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // 要素の交換
  }
  return array;
}


export function addMinutesToDate(date, minutes) {
  return new Date(date.getTime() + minutes * 60000);
}


export const formatDate = (dateString) => {
  const date = new Date(dateString);
  const days = ['日', '月', '火', '水', '木', '金', '土'];
  const dayName = days[date.getDay()];
  return `${date.getMonth() + 1}月${date.getDate()}日(${dayName}) ${date.getHours()}時${date.getMinutes()}分`;
};

export function convertToSSML(text) {
  // 英単語を検出してSSMLタグで囲む正規表現
  const regex = /\b([a-zA-Z\[\]]+)\b/g;

  // 英単語に<lang>タグを適用
  const ssmlText = text.replace(regex, (match) => `<lang xml:lang="en-US">${match}</lang>`);

  // 最終的なSSML
  return `<speak>${ssmlText}</speak>`;
}

export function markdownToHTML(text) {
  // 見出し（#）
  text = text.replace(/^### (.*$)/gim, '<h3>$1</h3>');  // H3
  text = text.replace(/^## (.*$)/gim, '<h2>$1</h2>');   // H2
  text = text.replace(/^# (.*$)/gim, '<h1>$1</h1>');    // H1

  // 強調（*italic*）
  text = text.replace(/\*(.*?)\*/gim, '<em>$1</em>');

  // 太字（**bold**）
  text = text.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');

  // 番号なしリスト（-）
  text = text.replace(/^\- (.*$)/gim, '<li>$1</li>');
  text = text.replace(/<\/li>(\n<li>)/gim, '<ul>$1</ul>'); // リストの囲み

  // 改行
  text = text.replace(/\n$/gim, '<br />');

  return text.trim(); // 余分な空白の削除
}

