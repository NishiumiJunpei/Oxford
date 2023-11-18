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
  