import { NextResponse } from "next/server";

export async function GET() {
  const Events = [
    {
      id: 1,
      title: "𝗛.𝗛 𝗜𝗺𝗽𝗲𝘅 𝗠𝗲𝗺𝗼𝗻 𝗖𝗼𝗺𝗺𝘂𝗻𝗶𝘁𝘆 𝗖𝗿𝗶𝗰𝗸𝗲𝘁 𝗟𝗲𝗮𝗴𝘂𝗲",
      desc: "🏏𝗛.𝗛 𝗜𝗺𝗽𝗲𝘅 𝗠𝗲𝗺𝗼𝗻 𝗖𝗼𝗺𝗺𝘂𝗻𝗶𝘁𝘆 𝗖𝗿𝗶𝗰𝗸𝗲𝘁 𝗟𝗲𝗮𝗴𝘂𝗲 - 𝗠𝗖𝗖𝗟 𝗦𝗲𝗮𝘀𝗼𝗻 𝟭 𝗽𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗝𝗮𝗺𝗻𝗮𝗴𝗮𝗿 𝗪𝗲𝗵𝘃𝗮𝗿𝗶𝗮 𝗠𝗲𝗺𝗼𝗻 𝗝𝗮𝗺𝗮𝘁 & 𝗬𝗼𝘂𝘁𝗵 𝗢𝗿𝗴𝗮𝗻𝗶𝘇𝗮𝘁𝗶𝗼𝗻🏏\n🌟 𝗜𝗻𝘁𝗲𝗿 𝗝𝗮𝗺𝗮𝘁 𝗛𝗮𝗿𝗱𝗯𝗮𝗹𝗹 𝗧𝗼𝘂𝗿𝗻𝗮𝗺𝗲𝗻𝘁 🌟\nHere are some glimpses from the 𝗚𝗿𝗮𝗻𝗱 𝗟𝗮𝘂𝗻𝗰𝗵 𝗣𝗮𝗿𝘁𝘆 of 𝗛.𝗛 𝗜𝗺𝗽𝗲𝘅 𝗠𝗲𝗺𝗼𝗻 𝗖𝗼𝗺𝗺𝘂𝗻𝗶𝘁𝘆 𝗖𝗿𝗶𝗰𝗸𝗲𝘁 𝗟𝗲𝗮𝗴𝘂𝗲 - 𝗠𝗖𝗖𝗟 𝗦𝗲𝗮𝘀𝗼𝗻 𝟭 𝗽𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗝𝗮𝗺𝗻𝗮𝗴𝗮𝗿 𝗪𝗲𝗵𝘃𝗮𝗿𝗶𝗮 𝗠𝗲𝗺𝗼𝗻 𝗝𝗮𝗺𝗮𝘁 & 𝗬𝗼𝘂𝘁𝗵 𝗢𝗿𝗴𝗮𝗻𝗶𝘇𝗮𝘁𝗶𝗼𝗻\nFrom the grand 𝘁𝗿𝗼𝗽𝗵𝘆 𝘂𝗻𝘃𝗲𝗶𝗹𝗶𝗻𝗴 to 𝘁𝗲𝗮𝗺 𝗸𝗶𝘁 𝗿𝗲𝘃𝗲𝗮𝗹𝘀, heartfelt speeches, and the electrifying atmosphere, the event marked the beginning of an exciting journey for Memon cricket! 🏏\nStay tuned as we continue to celebrate unity, sportsmanship, and the indomitable spirit of the Memon community. ",
      date: "2024-11-27",
      category: "Sports Events",
      img: "https://scontent.fkhi16-2.fna.fbcdn.net/v/t39.30808-6/468546419_122123035460554297_9108722500386603893_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=127cfc&_nc_ohc=9Qds4uUGB5UQ7kNvwG5Nxi1&_nc_oc=AdmOOxNdhVCowKQrPmdD0Sy7u-dzKCtpXSxUMSogZgdXwhUwpVujCJh1Ghmiuqqu37s&_nc_zt=23&_nc_ht=scontent.fkhi16-2.fna&_nc_gid=d0O0qiqaOrfg0QCrQ3Cpjg&oh=00_AfabrmWOQGG2fE6jMmfPgqNrBfaG-1EM1lwOCzEBkEQpEQ&oe=68C0F212",
      fb: "https://www.facebook.com/story.php?story_fbid=122123049026554297&id=61566628934448&rdid=MYLzbI0gPt8AZ0QQ#",
    },
    {
      id: 2,
      title: "Wehvaria Badminton Tournament 2024",
      date: "2024-09-27",
      category: "Sports Events",
      img: "https://scontent.fkhi16-1.fna.fbcdn.net/v/t39.30808-6/484560540_1025351136314472_8242479245133105683_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=f727a1&_nc_ohc=fmQ6pnUf0i8Q7kNvwHyxfN6&_nc_oc=AdnERTWYAcD-MtJ-BeMCxNM7GAhWV730w6ODZACwHntxz7KAzoMjWxehVtyz7DyUtXk&_nc_zt=23&_nc_ht=scontent.fkhi16-1.fna&_nc_gid=wFtNriU1plsBMn8U_i924w&oh=00_AfaS8am23pDFQHOT7XQcDlvnQ1IskhKE3W69U8vhC_8jYg&oe=68C0E94E",
      fb: "https://www.facebook.com/story.php?story_fbid=938538578329062&id=100065187842558&rdid=subJojqt7MqaCJlh#",
    },
    {
      id: 3,
      title: "مقابلہ قرأت و نعت رسول مقبول ﷺ",
      date: "2025-01-12",
      category: "Islamic Events",
      img: "https://scontent.fkhi16-1.fna.fbcdn.net/v/t39.30808-6/480782695_636957195378598_2765270133886582508_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=aa7b47&_nc_ohc=gQprQvu_ANsQ7kNvwHo_d1e&_nc_oc=Adkf1mkcfBAZyC-mlH1i_GaUPIXdkOXIb5hEP1OatVMSBRqeMfN-6ZYph5Dv7Z3FqHs&_nc_zt=23&_nc_ht=scontent.fkhi16-1.fna&_nc_gid=2R_F-eAswsWEQcTyJzsedQ&oh=00_AfZyq-bnCxuG7jDIQz4UHIamP2MDPmyriqMDyoGWvA1uJA&oe=68C0E96F",
      fb: "https://www.facebook.com/groups/JWMJYO/permalink/10161245147405945/?rdid=8fHFulUbWLtfq35E#",
    },
  ];
  return NextResponse.json(Events);
}
