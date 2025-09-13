import { NextResponse } from "next/server";

export async function GET() {
  const Events = [
    {
      id: 1,
      title: "𝗛.𝗛 𝗜𝗺𝗽𝗲𝘅 𝗠𝗲𝗺𝗼𝗻 𝗖𝗼𝗺𝗺𝘂𝗻𝗶𝘁𝘆 𝗖𝗿𝗶𝗰𝗸𝗲𝘁 𝗟𝗲𝗮𝗴𝘂𝗲",
      desc: "🏏𝗛.𝗛 𝗜𝗺𝗽𝗲𝘅 𝗠𝗲𝗺𝗼𝗻 𝗖𝗼𝗺𝗺𝘂𝗻𝗶𝘁𝘆 𝗖𝗿𝗶𝗰𝗸𝗲𝘁 𝗟𝗲𝗮𝗴𝘂𝗲 - 𝗠𝗖𝗖𝗟 𝗦𝗲𝗮𝘀𝗼𝗻 𝟭 𝗽𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗝𝗮𝗺𝗻𝗮𝗴𝗮𝗿 𝗪𝗲𝗵𝘃𝗮𝗿𝗶𝗮 𝗠𝗲𝗺𝗼𝗻 𝗝𝗮𝗺𝗮𝘁 & 𝗬𝗼𝘂𝘁𝗵 𝗢𝗿𝗴𝗮𝗻𝗶𝘇𝗮𝘁𝗶𝗼𝗻🏏\n🌟 𝗜𝗻𝘁𝗲𝗿 𝗝𝗮𝗺𝗮𝘁 𝗛𝗮𝗿𝗱𝗯𝗮𝗹𝗹 𝗧𝗼𝘂𝗿𝗻𝗮𝗺𝗲𝗻𝘁 🌟\nHere are some glimpses from the 𝗚𝗿𝗮𝗻𝗱 𝗟𝗮𝘂𝗻𝗰𝗵 𝗣𝗮𝗿𝘁𝘆 of 𝗛.𝗛 𝗜𝗺𝗽𝗲𝘅 𝗠𝗲𝗺𝗼𝗻 𝗖𝗼𝗺𝗺𝘂𝗻𝗶𝘁𝘆 𝗖𝗿𝗶𝗰𝗸𝗲𝘁 𝗟𝗲𝗮𝗴𝘂𝗲 - 𝗠𝗖𝗖𝗟 𝗦𝗲𝗮𝘀𝗼𝗻 𝟭 𝗽𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗝𝗮𝗺𝗻𝗮𝗴𝗮𝗿 𝗪𝗲𝗵𝘃𝗮𝗿𝗶𝗮 𝗠𝗲𝗺𝗼𝗻 𝗝𝗮𝗺𝗮𝘁 & 𝗬𝗼𝘂𝘁𝗵 𝗢𝗿𝗴𝗮𝗻𝗶𝘇𝗮𝘁𝗶𝗼𝗻\nFrom the grand 𝘁𝗿𝗼𝗽𝗵𝘆 𝘂𝗻𝘃𝗲𝗶𝗹𝗶𝗻𝗴 to 𝘁𝗲𝗮𝗺 𝗸𝗶𝘁 𝗿𝗲𝘃𝗲𝗮𝗹𝘀, heartfelt speeches, and the electrifying atmosphere, the event marked the beginning of an exciting journey for Memon cricket! 🏏\nStay tuned as we continue to celebrate unity, sportsmanship, and the indomitable spirit of the Memon community. ",
      date: "2024-11-27",
      category: "Sports Events",
      img: "/Events/1.jpg",
      fb: "https://www.facebook.com/story.php?story_fbid=122123049026554297&id=61566628934448&rdid=MYLzbI0gPt8AZ0QQ#",
    },
    {
      id: 2,
      title: "Wehvaria Badminton Tournament 2024",
      date: "2024-09-27",
      category: "Sports Events",
      img: "/Events/2.jpg",
      fb: "https://www.facebook.com/story.php?story_fbid=938538578329062&id=100065187842558&rdid=subJojqt7MqaCJlh#",
    },
    {
      id: 3,
      title: "مقابلہ قرأت و نعت رسول مقبول ﷺ",
      date: "2025-01-12",
      category: "Islamic Events",
      img: "/Events/3.jpg",
      fb: "https://www.facebook.com/groups/JWMJYO/permalink/10161245147405945/?rdid=8fHFulUbWLtfq35E#",
    },
  ];
  return NextResponse.json(Events);
}
