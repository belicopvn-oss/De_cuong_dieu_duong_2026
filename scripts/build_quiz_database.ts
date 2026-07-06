import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

const __dirname = path.resolve();

// Define files
const ocrFiles = [
  path.join(__dirname, 'scripts', 'ocr_part1.txt'),
  path.join(__dirname, 'scripts', 'ocr_part2.txt'),
  path.join(__dirname, 'scripts', 'ocr_part3.txt'),
  path.join(__dirname, 'scripts', 'ocr_part4.txt'),
  path.join(__dirname, 'scripts', 'ocr_part5.txt'),
  path.join(__dirname, 'scripts', 'ocr_part6.txt'),
  path.join(__dirname, 'scripts', 'ocr_part7.txt')
];
const outputPath = path.join(__dirname, 'src', 'data', 'questions.json');

// Types
interface RawQuestion {
  id: number;
  question: string;
  options: string[];
  answer: string;
  category: string;
}

// Ensure directory exists
const dir = path.dirname(outputPath);
if (!fs.existsSync(dir)){
  fs.mkdirSync(dir, { recursive: true });
}

// 1. Parser for our OCR files
function parseOCRFile(filePath: string): RawQuestion[] {
  console.log(`Parsing ${filePath}...`);
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const questions: RawQuestion[] = [];
  
  let currentQ: Partial<RawQuestion> | null = null;
  let inOptions = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Check if new question
    const qMatch = line.match(/^(\d+)\.\s*(.*)/);
    if (qMatch) {
      if (currentQ && currentQ.id && currentQ.question) {
        questions.push(currentQ as RawQuestion);
      }
      
      const qId = parseInt(qMatch[1], 10);
      const qText = qMatch[2];
      
      // Determine category based on ID ranges or contents
      let category = 'Chăm sóc cơ bản';
      if (qId >= 13 && qId <= 35) category = 'Cấp cứu & Hồi sức';
      else if (qId >= 36 && qId <= 50) category = 'Ngoại khoa';
      else if (qId >= 51 && qId <= 66) category = 'Sản - Nhi';
      else if (qId >= 67 && qId <= 86) category = 'Chuẩn đạo đức & Quy định';
      else if (qId >= 87 && qId <= 116) category = 'Cấp cứu & Ngoại khoa';
      else if (qId >= 117 && qId <= 162) category = 'Ngoại, Sản, Nhi';
      else if (qId >= 163 && qId <= 186) category = 'Chuẩn đạo đức & Quy định';
      else if (qId >= 187 && qId <= 217) category = 'An toàn người bệnh & Tiêm an toàn';
      else if (qId >= 218 && qId <= 272) category = 'Kiểm soát nhiễm khuẩn & Phòng ngừa chuẩn';
      else if (qId >= 273 && qId <= 300) category = 'Cấp cứu & Hồi sức';
      else if (qId >= 301 && qId <= 333) category = 'Điều dưỡng Nội khoa';
      else if (qId >= 334 && qId <= 377) category = 'Chăm sóc Ngoại khoa & Chấn thương';
      else if (qId >= 378 && qId <= 404) category = 'Ung thư & Chăm sóc giảm nhẹ';
      else if (qId >= 405 && qId <= 474) category = 'Chăm sóc Nhi khoa';
      else if (qId >= 475 && qId <= 547) category = 'Chăm sóc Sản khoa & Phụ khoa';
      else if (qId >= 548 && qId <= 561) category = 'Giải phẫu bệnh & Nội soi';
      else if (qId >= 562 && qId <= 600) category = 'Gây mê & Hồi sức Ngoại khoa';
      else if (qId >= 601 && qId <= 650) category = 'Xét nghiệm & Truyền máu';
      else if (qId >= 651 && qId <= 679) category = 'Vi sinh & Ký sinh trùng';
      else if (qId >= 680 && qId <= 700) category = 'Hóa sinh & Khí máu';
      else if (qId >= 701 && qId <= 712) category = 'Xét nghiệm & Quản lý chất thải';
      else if (qId >= 713 && qId <= 800) category = 'Kiểm soát nhiễm khuẩn & Phòng ngừa chuẩn';
      
      currentQ = {
        id: qId,
        question: qText,
        options: [],
        answer: 'A',
        category: category
      };
      inOptions = true;
      continue;
    }
    
    // Check options
    if (inOptions && currentQ) {
      const optionMatch = line.match(/^([A-D])[\.\-]\s*(.*)/);
      if (optionMatch) {
        currentQ.options!.push(`${optionMatch[1]}. ${optionMatch[2]}`);
        continue;
      }
      
      const ansMatch = line.match(/^Đáp án đúng:\s*([A-D])/);
      if (ansMatch) {
        currentQ.answer = ansMatch[1];
        inOptions = false;
        continue;
      }
      
      // Append to question text if it spans multiple lines before options
      if (currentQ.options!.length === 0 && !line.startsWith('Đáp án đúng:')) {
        currentQ.question += ' ' + line;
      }
    }
  }
  
  // Push last question
  if (currentQ && currentQ.id && currentQ.question) {
    questions.push(currentQ as RawQuestion);
  }
  
  return questions;
}

// Run parser
let allQuestions: RawQuestion[] = [];
try {
  ocrFiles.forEach(file => {
    if (fs.existsSync(file)) {
      allQuestions = allQuestions.concat(parseOCRFile(file));
    }
  });
} catch (err) {
  console.error("Error parsing OCR files:", err);
}

console.log(`Parsed ${allQuestions.length} real questions successfully.`);

// Ensure sorting
allQuestions.sort((a, b) => a.id - b.id);

// 2. Procedural fall-back questions generator to complete exactly 800 questions
// This guarantees success even if API is not configured or hits limits.
const categories = [
  'Chăm sóc cơ bản (Điều dưỡng Nội khoa)',
  'Chăm sóc Ngoại khoa & Phục hồi chức năng',
  'Chăm sóc Sản khoa & Phụ khoa',
  'Chăm sóc Nhi khoa',
  'Kiểm soát nhiễm khuẩn & Vệ sinh môi trường',
  'An toàn người bệnh & Quản lý sự cố',
  'Quy tắc ứng xử & Đạo đức nghề nghiệp',
  'Cấp cứu hồi sức nâng cao (Hô hấp, Tuần hoàn)'
];

const questionTemplates = [
  {
    question: "Khi chăm sóc người bệnh tăng huyết áp, điều dưỡng cần hướng dẫn chế độ ăn giảm muối với lượng muối tối đa mỗi ngày là bao nhiêu?",
    options: ["A. Dưới 5g muối/ngày", "B. Dưới 10g muối/ngày", "C. Dưới 15g muối/ngày", "D. Ăn hoàn toàn không muối"],
    answer: "A",
    category: "Chăm sóc cơ bản (Điều dưỡng Nội khoa)"
  },
  {
    question: "Tai biến nguy hiểm nhất có thể xảy ra khi truyền dịch tĩnh mạch quá nhanh ở người bệnh suy tim là gì?",
    options: ["A. Phù phổi cấp", "B. Sốc phản vệ", "C. Nhiễm khuẩn huyết", "D. Tắc mạch khí"],
    answer: "A",
    category: "Cấp cứu hồi sức nâng cao (Hô hấp, Tuần hoàn)"
  },
  {
    question: "Theo phân loại Spaulding, dụng cụ nội soi dạ dày mềm là dụng cụ thuộc nhóm nào và yêu cầu xử lý tương ứng là gì?",
    options: ["A. Dụng cụ cực kỳ thiết yếu - Tiệt khuẩn", "B. Dụng cụ bán thiết yếu - Khử khuẩn mức độ cao", "C. Dụng cụ không thiết yếu - Khử khuẩn mức độ thấp", "D. Dụng cụ bán thiết yếu - Khử khuẩn mức độ trung bình"],
    answer: "B",
    category: "Kiểm soát nhiễm khuẩn & Vệ sinh môi trường"
  },
  {
    question: "Để phòng ngừa loét tỳ đè ở người bệnh nằm lâu, điều dưỡng cần thay đổi tư thế cho người bệnh tối thiểu bao lâu một lần?",
    options: ["A. Ít nhất 2 giờ/lần", "B. Ít nhất 4 giờ/lần", "C. Ít nhất 6 giờ/lần", "D. Mỗi ngày 2 lần"],
    answer: "A",
    category: "Chăm sóc cơ bản (Điều dưỡng Nội khoa)"
  },
  {
    question: "Đối với người bệnh sau mổ sỏi đường mật có đặt ống dẫn lưu Kehr, điều dưỡng cần theo dõi tính chất dịch mật bình thường có đặc điểm gì?",
    options: ["A. Dịch màu xanh đen, đặc, không mùi", "B. Dịch màu vàng hổ phách, trong, không có mủ", "C. Dịch màu đỏ tươi, loãng", "D. Dịch màu trắng sữa, đục"],
    answer: "B",
    category: "Chăm sóc Ngoại khoa & Phục hồi chức năng"
  },
  {
    question: "Mục đích quan trọng nhất của việc thực hiện 'Bảng kiểm an toàn phẫu thuật' trước khi rạch da là gì?",
    options: ["A. Tiết kiệm thời gian mổ", "B. Tránh nhầm lẫn người bệnh, nhầm phương pháp và vị trí mổ", "C. Đánh giá tay nghề phẫu thuật viên", "D. Giảm chi phí phẫu thuật cho người bệnh"],
    answer: "B",
    category: "An toàn người bệnh & Quản lý sự cố"
  },
  {
    question: "Dấu hiệu sớm nhất và có giá trị nhất để chẩn đoán trẻ sơ sinh bị suy hô hấp sau sinh là gì?",
    options: ["A. Thở nhanh nông, nhịp thở trên 60 lần/phút", "B. Tím tái toàn thân", "C. Trẻ khóc yếu", "D. Nhịp tim giảm dưới 100 lần/phút"],
    answer: "A",
    category: "Chăm sóc Nhi khoa"
  },
  {
    question: "Thời gian tối đa để lưu kim luồn tĩnh mạch ngoại vi cho một người bệnh ổn định (không viêm) là bao lâu?",
    A: "A. 24 giờ",
    B: "B. 48 giờ",
    C: "C. 72 - 96 giờ",
    D: "D. 7 ngày",
    options: ["A. 24 giờ", "B. 48 giờ", "C. 72 - 96 giờ", "D. Không giới hạn thời gian"],
    answer: "C",
    category: "An toàn người bệnh"
  }
];

function generateProceduralQuestions(startId, endId) {
  const NAMES = [
    "Nguyễn Văn An", "Trần Thị Bình", "Lê Văn Cường", "Phạm Minh Dũng", "Nguyễn Thị Hoa",
    "Phan Văn Giang", "Vũ Thị Hương", "Đỗ Minh Hải", "Hoàng Thị Yến", "Bùi Văn Khánh",
    "Ngô Quốc Bảo", "Đặng Thùy Trang", "Trịnh Đình Khang", "Lý Thu Thảo", "Vũ Hồng Sơn",
    "Phạm Thanh Hà", "Hoàng Văn Tuấn", "Trần Mai Anh", "Nguyễn Đức Phúc", "Lê Tuyết Mai"
  ];
  const AGES = [24, 32, 45, 52, 58, 62, 67, 73, 79, 84];

  const templates = [
    {
      category: "Điều dưỡng Nội khoa",
      q: "Người bệnh {name}, {age} tuổi, điều trị viêm phổi với sốt {temp}, ho khạc đờm đặc. Điều dưỡng cần thực hiện can thiệp nào ưu tiên để làm thông thoáng đường thở?",
      opt: [
        "A. Hướng dẫn người bệnh ho hiệu quả và uống đủ nước ấm",
        "B. Cho người bệnh nằm đầu thấp nghiêng một bên",
        "C. Vỗ rung lồng ngực liên tục mỗi 30 phút",
        "D. Hút đờm dãi bằng máy áp lực cao mỗi khi ho"
      ],
      ans: "A",
      exp: "Hướng dẫn ho có hiệu quả và cung cấp đủ nước giúp làm loãng đờm, tăng hiệu quả tống thải dịch tiết đường thở tự nhiên mà không gây sang chấn phế quản."
    },
    {
      category: "Điều dưỡng Nội khoa",
      q: "Người bệnh {name}, {age} tuổi, tiền sử đái tháo đường đang truyền dịch Glucose 5%. Sau truyền 2 giờ, người bệnh đột ngột run tay, vã mồ hôi, nhịp tim {hr}. Nhận định nào sau đây là phù hợp nhất?",
      opt: [
        "A. Hạ đường huyết đột ngột",
        "B. Sốc phản vệ độ 1",
        "C. Quá tải tuần hoàn cấp",
        "D. Phản ứng sốt do dịch truyền"
      ],
      ans: "A",
      exp: "Các triệu chứng vã mồ hôi, bủn rủn chân tay, nhịp tim nhanh là biểu hiện điển hình của hạ đường huyết, cần được đo đường huyết mao mạch ngay lập tức."
    },
    {
      category: "Điều dưỡng Nội khoa",
      q: "Người bệnh {name}, {age} tuổi, chẩn đoán suy tim có huyết áp {bp}. Điều dưỡng thực hiện kỹ thuật tiêm tĩnh mạch thuốc Digoxin. Can thiệp nào bắt buộc phải thực hiện trước khi tiêm?",
      opt: [
        "A. Đếm nhịp tim đầy đủ trong 1 phút",
        "B. Đo nhiệt độ cơ thể",
        "C. Cho người bệnh uống 1 cốc nước ấm",
        "D. Kiểm tra lượng nước tiểu 24 giờ"
      ],
      ans: "A",
      exp: "Digoxin làm chậm nhịp tim. Nếu nhịp tim dưới 60 lần/phút, phải tạm dừng thuốc và báo ngay cho bác sĩ điều trị để tránh tai biến ngộ độc thuốc."
    },
    {
      category: "Điều dưỡng Nội khoa",
      q: "Khi chăm sóc người bệnh {name} có vết loét tỳ đè độ II vùng cùng cụt, điều dưỡng cần áp dụng can thiệp nào sau đây?",
      opt: [
        "A. Rửa vết loét bằng nước muối sinh lý, đắp gạc ẩm vô khuẩn và thay đổi tư thế mỗi 2 giờ",
        "B. Xoa bóp trực tiếp xung quanh vùng loét bằng cồn 70 độ",
        "C. Thoa bột kháng sinh trực tiếp lên bề mặt vết loét",
        "D. Chiếu đèn hồng ngoại liên tục để làm khô vết loét"
      ],
      ans: "A",
      exp: "Loét độ II cần được làm sạch bằng dung dịch nước muối sinh lý, bảo vệ bằng gạc ẩm vô khuẩn để kích thích biểu mô hóa và xoay trở tư thế thường quy phòng ngừa loét lan rộng."
    },
    {
      category: "Cấp cứu & Hồi sức nâng cao",
      q: "Người bệnh {name}, {age} tuổi, đột ngột ngừng tuần hoàn. Khi thực hiện ép tim ngoài lồng ngực cho người bệnh, tần số ép tim tiêu chuẩn là bao nhiêu?",
      opt: [
        "A. 100 - 120 lần/phút",
        "B. 60 - 80 lần/phút",
        "C. 80 - 100 lần/phút",
        "D. Trên 130 lần/phút"
      ],
      ans: "A",
      exp: "Theo hướng dẫn của Hiệp hội Tim mạch Hoa Kỳ (AHA), tần số ép tim tiêu chuẩn cho người lớn là 100 đến 120 lần/phút để đảm bảo tưới máu não và mạch vành tối ưu."
    },
    {
      category: "Cấp cứu & Hồi sức nâng cao",
      q: "Khi hồi sức tim phổi nâng cao (CPR) cho người lớn với 2 nhân viên y tế, tỷ lệ ép tim / thổi ngạt tiêu chuẩn khi chưa đặt nội khí quản là:",
      opt: [
        "A. 30 : 2",
        "B. 15 : 2",
        "C. 5 : 1",
        "D. 15 : 1"
      ],
      ans: "A",
      exp: "Tỷ lệ ép tim / thông khí tiêu chuẩn cho người lớn luôn là 30:2 bất kể có 1 hay 2 người thực hiện hồi sức, cho đến khi đường thở nâng cao được thiết lập."
    },
    {
      category: "Cấp cứu & Hồi sức nâng cao",
      q: "Người bệnh {name} được chỉ định thở máy oxy dòng cao (HFNC) với SpO2 hiện tại là {spo2}. Điều dưỡng cần theo dõi thông số nào để đánh giá sớm tình trạng đáp ứng thở máy?",
      opt: [
        "A. Nhịp thở, mức độ gắng sức cơ hô hấp và chỉ số ROX",
        "B. Chỉ số huyết áp động mạch",
        "C. Thể tích nước tiểu mỗi giờ",
        "D. Độ bão hòa oxy máu động mạch riêng lẻ"
      ],
      ans: "A",
      exp: "Nhịp thở và mức độ co kéo cơ hô hấp phụ kết hợp chỉ số ROX (SpO2/FiO2/Nhịp thở) là những chỉ số nhạy bén nhất để đánh giá thất bại của HFNC và chỉ định đặt nội khí quản kịp thời."
    },
    {
      category: "Cấp cứu & Hồi sức nâng cao",
      q: "Khi người bệnh {name}, {age} tuổi, có dấu hiệu tắc nghẽn đường thở do dị vật và còn tỉnh táo, điều dưỡng nên thực hiện nghiệm pháp nào?",
      opt: [
        "A. Nghiệm pháp Heimlich",
        "B. Ép tim ngoài lồng ngực",
        "C. Thổi ngạt trực tiếp",
        "D. Chọc màng giáp nhẫn cấp cứu"
      ],
      ans: "A",
      exp: "Nghiệm pháp Heimlich (ép bụng) giúp tạo áp lực dương đột ngột trong lồng ngực để tống xuất dị vật ra ngoài khi người bệnh còn tỉnh."
    },
    {
      category: "Chăm sóc Ngoại khoa & Chấn thương",
      q: "Người bệnh {name} sau mổ sỏi đường mật ngày thứ 3, đang đặt ống dẫn lưu Kehr. Điều dưỡng đo được lượng dịch mật chảy ra là 400ml/24h, dịch màu vàng hổ phách, trong. Nhận định nào sau đây là đúng?",
      opt: [
        "A. Lượng và tính chất dịch mật hoàn toàn bình thường",
        "B. Người bệnh bị tắc mật nặng",
        "C. Có biến chứng rò mật vào ổ bụng",
        "D. Nhiễm trùng đường mật cấp"
      ],
      ans: "A",
      exp: "Lượng dịch mật bình thường qua ống Kehr dao động từ 300 - 500ml/24 giờ, màu vàng hổ phách hoặc vàng nâu, trong suốt. Đây là diễn tiến lâm sàng bình thường."
    },
    {
      category: "Chăm sóc Ngoại khoa & Chấn thương",
      q: "Người bệnh {name} có dẫn lưu màng phổi kín sau chấn thương ngực. Điều dưỡng quan sát thấy cột nước trong bình bẫy dẫn lưu dao động theo nhịp thở. Điều này chứng tỏ:",
      opt: [
        "A. Hệ thống dẫn lưu hoạt động tốt và thông suốt",
        "B. Hệ thống dẫn lưu bị hở khí",
        "C. Ống dẫn lưu bị tắc hoàn toàn",
        "D. Phổi đã giãn nở hoàn toàn"
      ],
      ans: "A",
      exp: "Cột nước dao động theo nhịp thở (lên khi hít vào, xuống khi thở ra) chứng tỏ hệ thống dẫn lưu thông suốt và áp lực âm trong khoang màng phổi đang được duy trì tốt."
    },
    {
      category: "Chăm sóc Ngoại khoa & Chấn thương",
      q: "Biến chứng muộn nguy hiểm nhất cần phòng ngừa khi chăm sóc người bệnh {name} bó bột đùi cẳng bàn chân gãy xương đùi là gì?",
      opt: [
        "A. Teo cơ, cứng khớp và hội chứng chèn ép khoang cấp tính",
        "B. Viêm da dị ứng do bột",
        "C. Loét tỳ đè vùng gót chân",
        "D. Nhiễm trùng ngược dòng"
      ],
      ans: "A",
      exp: "Bó bột lâu ngày không vận động gây nguy cơ cao teo cơ, cứng khớp. Hội chứng chèn ép khoang là biến chứng cấp tính nguy hiểm nhất có thể hoại tử chi nếu không phát hiện sớm."
    },
    {
      category: "Chăm sóc Ngoại khoa & Chấn thương",
      q: "Người bệnh {name}, {age} tuổi, mổ nội soi cắt ruột thừa ngày thứ nhất. Can thiệp điều dưỡng giúp phòng ngừa sớm biến chứng tắc ruột và dính ruột sau mổ là:",
      opt: [
        "A. Hướng dẫn và hỗ trợ người bệnh vận động, ngồi dậy và đi lại sớm tại phòng",
        "B. Cho người bệnh ăn cháo đặc ngay lập tức",
        "C. Thực hiện thụt tháo đại tràng hàng ngày",
        "D. Giữ người bệnh nằm yên tuyệt đối tại giường trong 3 ngày"
      ],
      ans: "A",
      exp: "Vận động sớm sau mổ giúp kích thích nhu động ruột hoạt động trở lại, tăng lưu thông tuần hoàn và phòng ngừa hiệu quả dính ruột, tắc ruột cơ năng."
    },
    {
      category: "Chăm sóc Sản khoa & Phụ khoa",
      q: "Thai phụ {name}, 28 tuổi, mang thai lần đầu được {age} tuần, vào viện vì đau bụng từng cơn. Để xác định sản phụ có thực sự chuyển dạ, chỉ số quan trọng nhất cần theo dõi là gì?",
      opt: [
        "A. Cơn co tử cung đều đặn và sự xóa mở cổ tử cung",
        "B. Tình trạng ra nước ối",
        "C. Nhịp tim thai dao động",
        "D. Mức độ đau bụng của sản phụ"
      ],
      ans: "A",
      exp: "Chuyển dạ thật sự được chẩn đoán dựa trên sự xuất hiện của cơn co tử cung hiệu quả (đều đặn, tăng dần về tần số và cường độ) kèm theo sự xóa mở của cổ tử cung."
    },
    {
      category: "Chăm sóc Sản khoa & Phụ khoa",
      q: "Sản phụ {name} sau sinh thường giờ thứ 2, xuất hiện máu đỏ tươi chảy ra từ âm đạo nhiều, tử cung co hồi kém, nhão. Can thiệp xử trí ban đầu khẩn cấp của điều dưỡng là gì?",
      opt: [
        "A. Xoa bóp tử cung qua thành bụng liên tục để kích thích co hồi tử cung",
        "B. Đặt người bệnh nằm đầu cao, chân thấp",
        "C. Tiến hành khâu vết rách tầng sinh môn ngay lập tức",
        "D. Cho sản phụ uống nước đường ấm gừng"
      ],
      ans: "A",
      exp: "Đờ tử cung là nguyên nhân hàng đầu gây băng huyết sau sinh. Xoa bóp tử cung liên tục qua thành bụng là can thiệp ban đầu khẩn cấp để kích thích cơ tử cung co hồi chặt, kiểm soát chảy máu."
    },
    {
      category: "Chăm sóc Sản khoa & Phụ khoa",
      q: "Khi chăm sóc sản phụ {name} bị tiền sản giật nặng với huyết áp {bp}, biến chứng nguy hiểm nhất cần theo dõi sát để xử trí kịp thời là gì?",
      opt: [
        "A. Cơn co giật sản giật",
        "B. Thiếu máu nhược sắc",
        "C. Viêm tắc tĩnh mạch chi dưới",
        "D. Đái tháo đường thai kỳ"
      ],
      ans: "A",
      exp: "Tiền sản giật nặng có thể tiến triển thành sản giật (cơn co giật toàn thân nguy hiểm đến tính mạng của cả mẹ và con). Cần chuẩn bị sẵn Magnesium Sulfate để xử trí."
    },
    {
      category: "Chăm sóc Nhi khoa",
      q: "Trẻ sơ sinh con bà {name} được 3 ngày tuổi, xuất hiện vàng da nhẹ vùng mặt và ngực, trẻ bú tốt, không sốt, phân vàng. Nhận định lâm sàng phù hợp nhất là gì?",
      opt: [
        "A. Vàng da sinh lý bình thường",
        "B. Vàng da nhân não nguy hiểm",
        "C. Tắc mật bẩm sinh",
        "D. Bất đồng nhóm máu mẹ con ABO"
      ],
      ans: "A",
      exp: "Vàng da xuất hiện sau 24 giờ tuổi, chỉ khu trú vùng mặt, ngực, trẻ vẫn khỏe mạnh, bú tốt là biểu hiện của vàng da sinh lý, thường tự biến mất sau 1-2 tuần."
    },
    {
      category: "Chăm sóc Nhi khoa",
      q: "Trẻ {age} tháng tuổi, cân nặng 8kg, được đưa đến viện vì sốt cao {temp}, có tiền sử co giật do sốt cao. Can thiệp ưu tiên hàng đầu của điều dưỡng là:",
      opt: [
        "A. Thực hiện hạ sốt khẩn cấp bằng Paracetamol đặt hậu môn và lau ấm tích cực",
        "B. Cho trẻ uống thuốc hạ sốt đường uống ngay lập tức",
        "C. Đút thìa vào miệng để phòng trẻ cắn lưỡi",
        "D. Cho trẻ tắm nước lạnh để hạ nhiệt nhanh"
      ],
      ans: "A",
      exp: "Trẻ có tiền sử co giật cần được hạ sốt nhanh và an toàn. Khi trẻ sốt cao nguy cơ co giật, dùng Paracetamol đường tọa dược (đặt hậu môn) kết hợp lau ấm vùng nách, bẹn là phương pháp tối ưu."
    },
    {
      category: "Chăm sóc Nhi khoa",
      q: "Trẻ em bị tiêu chảy cấp. Dấu hiệu mất nước nặng nề nhất cần đưa trẻ đi cấp cứu ngay lập tức là:",
      opt: [
        "A. Trẻ li bì, lờ đờ hoặc hôn mê, mắt trũng sâu, nếp véo da mất rất chậm",
        "B. Trẻ khóc có nước mắt, đòi uống nước liên tục",
        "C. Trẻ đi ngoài phân lỏng 5 lần/ngày",
        "D. Trẻ biếng ăn, mệt mỏi nhẹ"
      ],
      ans: "A",
      exp: "Trẻ li bì, lờ đờ, mắt trũng, nếp véo da mất rất chậm (>2 giây) là các dấu hiệu mất nước nặng, đe dọa sốc giảm thể tích, cần truyền dịch cấp cứu ngay."
    },
    {
      category: "Kiểm soát nhiễm khuẩn & Vệ sinh",
      q: "Theo phân loại Spaulding, các dụng cụ y tế tiếp xúc trực tiếp với mô vô khuẩn hoặc mạch máu (như dao mổ, kim tiêm, kìm phẫu thuật) phải được xử lý ở mức độ nào?",
      opt: [
        "A. Tiệt khuẩn hoàn toàn",
        "B. Khử khuẩn mức độ cao",
        "C. Khử khuẩn mức độ trung bình",
        "D. Chỉ cần rửa sạch bằng xà phòng"
      ],
      ans: "A",
      exp: "Dụng cụ y tế tiếp xúc với mô vô khuẩn hoặc mạch máu thuộc nhóm thiết bị cực kỳ thiết yếu (critical devices), bắt buộc phải được tiệt khuẩn hoàn toàn trước khi tái sử dụng."
    },
    {
      category: "Kiểm soát nhiễm khuẩn & Vệ sinh",
      q: "Quy trình rửa tay thường quy bằng nước và xà phòng yêu cầu chà sát tay theo đúng 6 bước trong thời gian tối thiểu bao lâu?",
      opt: [
        "A. Ít nhất 30 giây",
        "B. Ít nhất 10 giây",
        "C. Ít nhất 15 giây",
        "D. Ít nhất 2 phút"
      ],
      ans: "A",
      exp: "Bộ Y tế Việt Nam quy định thời gian cho một lần rửa tay thường quy bằng xà phòng và nước tối thiểu là 30 giây, chà sát kỹ toàn bộ các bề mặt của tay."
    },
    {
      category: "Kiểm soát nhiễm khuẩn & Vệ sinh",
      q: "Theo Thông tư liên tịch 58/2015/TTLT-BYT-BTNMT, chất thải y tế lây nhiễm sắc nhọn (như kim tiêm, mảnh thủy tinh vỡ) phải được thu gom vào dụng cụ có màu sắc gì?",
      opt: [
        "A. Hộp hoặc thùng màu vàng, có biểu tượng lây nhiễm",
        "B. Túi nilon màu vàng dai bền",
        "C. Hộp màu xanh lá cây",
        "D. Thùng màu đen bóng"
      ],
      ans: "A",
      exp: "Chất thải sắc nhọn lây nhiễm phải được thu gom vào các thùng hoặc hộp kháng thủng (không bị kim đâm xuyên), có màu vàng đặc trưng và in logo cảnh báo nguy hại sinh học."
    },
    {
      category: "An toàn người bệnh & Quản lý sự cố",
      q: "Để xác định chính xác danh tính người bệnh {name} trước khi thực hiện quy trình tiêm thuốc, điều dưỡng cần đối chiếu tối thiểu mấy thông tin?",
      opt: [
        "A. Ít nhất 2 thông tin (Họ tên đầy đủ và Ngày tháng năm sinh/Mã bệnh nhân)",
        "B. Chỉ cần đối chiếu họ tên",
        "C. Chỉ cần đối chiếu số giường, số phòng",
        "D. Đối chiếu họ tên và số phòng bệnh"
      ],
      ans: "A",
      exp: "Để phòng ngừa nhầm lẫn người bệnh, luôn phải đối chiếu tối thiểu 2 chỉ số định danh trực tiếp từ người bệnh (hoặc vòng đeo tay) và không bao giờ được dùng số giường/số phòng làm thông tin đối chiếu."
    },
    {
      category: "An toàn người bệnh & Quản lý sự cố",
      q: "Y lệnh miệng bằng lời nói từ bác sĩ điều trị trong quá trình chăm sóc điều trị được chấp nhận trong hoàn cảnh nào sau đây?",
      opt: [
        "A. Chỉ trong các tình huống cấp cứu khẩn cấp nguy kịch",
        "B. Khi bác sĩ quá bận rộn không kịp ghi hồ sơ",
        "C. Khi thực hiện tiêm thuốc kháng sinh thường quy",
        "D. Mọi lúc khi có sự chứng kiến của 2 điều dưỡng"
      ],
      ans: "A",
      exp: "Y lệnh miệng chỉ được áp dụng trong tình huống cấp cứu khẩn cấp. Điều dưỡng nhận y lệnh cần lặp lại rõ ràng tên thuốc, liều lượng để bác sĩ xác nhận trước khi thực hiện và bác sĩ phải ký bổ sung y lệnh ngay sau khi ca cấp cứu kết thúc."
    },
    {
      category: "An toàn người bệnh & Quản lý sự cố",
      q: "Khi xảy ra sự cố y khoa (sự cố ngoài ý muốn) gây tổn thương nhẹ cho người bệnh {name}, hành động đầu tiên điều dưỡng cần làm là gì?",
      opt: [
        "A. Xử trí cấp cứu, chăm sóc tổn thương tại chỗ cho người bệnh ngay lập tức và báo bác sĩ",
        "B. Viết báo cáo sự cố tự nguyện ngay lập tức",
        "C. Gặp người nhà giải thích để xoa dịu tình hình",
        "D. Giữ bí mật và theo dõi sát diễn biến"
      ],
      ans: "A",
      exp: "Ưu tiên hàng đầu khi có sự cố xảy ra là đảm bảo an toàn cho người bệnh: xử trí khắc phục tổn thương ngay lập tức, sau đó mới tiến hành báo cáo và điều tra nguyên nhân."
    },
    {
      category: "Quy tắc ứng xử & Đạo đức nghề nghiệp",
      q: "Theo quy định về Đạo đức nghề nghiệp của Điều dưỡng Việt Nam, nguyên tắc tôn trọng quyền tự quyết của người bệnh được thể hiện qua hành động nào?",
      opt: [
        "A. Cung cấp đầy đủ thông tin về quy trình chăm sóc và nhận được sự đồng thuận của người bệnh",
        "B. Quyết định thay cho người bệnh khi họ tỏ ra phân vân",
        "C. Giấu kín các thông tin xấu về tiên lượng bệnh",
        "D. Thực hiện mọi yêu cầu của người bệnh kể cả không đúng chuyên môn"
      ],
      ans: "A",
      exp: "Tôn trọng sự tự quyết nghĩa là giải thích rõ ràng, trung thực về can thiệp điều dưỡng để người bệnh hiểu và tự nguyện đưa ra quyết định chấp thuận hoặc từ chối chăm sóc."
    },
    {
      category: "Quy tắc ứng xử & Đạo đức nghề nghiệp",
      q: "Khi người nhà của bệnh nhân {name} đưa phong bì cảm ơn điều dưỡng trước khi thực hiện kỹ thuật tiêm thuốc, điều dưỡng nên ứng xử thế nào để đúng quy định theo Thông tư 07/2014/TT-BYT?",
      opt: [
        "A. Lịch sự từ chối, giải thích rằng đây là trách nhiệm thường quy của nhân viên y tế",
        "B. Nhận phong bì và hứa sẽ chăm sóc chu đáo hơn",
        "C. Nhận phong bì rồi báo lại cho điều dưỡng trưởng",
        "D. Nghiêm khắc khiển trách người nhà bệnh nhân vì vi phạm nội quy"
      ],
      ans: "A",
      exp: "Thông tư 07/2014 quy định quy tắc ứng xử của công chức, viên chức y tế nghiêm cấm nhận tiền, quà cáp gợi ý từ người bệnh hoặc người nhà dưới mọi hình thức."
    },
    {
      category: "Điều dưỡng Nội khoa",
      q: "Người bệnh {name}, {age} tuổi, xơ gan cổ trướng mức độ nhiều, cảm giác khó thở, tức bụng khi nằm. Tư thế nằm nào phù hợp nhất điều dưỡng nên hướng dẫn cho người bệnh?",
      opt: [
        "A. Tư thế Fowler (đầu cao 30-45 độ)",
        "B. Tư thế nằm ngửa đầu thấp chân cao",
        "C. Tư thế nằm nghiêng hoàn toàn sang bên trái",
        "D. Tư thế nằm sấp có gối đỡ ngực"
      ],
      ans: "A",
      exp: "Tư thế Fowler đầu cao giúp dịch cổ trướng dồn xuống vùng thấp, giảm áp lực chèn ép của cơ hoành lên lồng ngực, giúp phổi nở tốt hơn và người bệnh dễ thở."
    },
    {
      category: "Điều dưỡng Nội khoa",
      q: "Điều dưỡng chăm sóc người bệnh {name}, {age} tuổi, đang điều trị xuất huyết tiêu hóa cao do loét dạ dày tá tràng. Chỉ số lâm sàng nào quan trọng nhất để nhận định tình trạng xuất huyết vẫn đang tiếp diễn?",
      opt: [
        "A. Huyết áp kẹt hoặc tụt, nhịp tim nhanh {hr}, người bệnh mệt lả, vã mồ hôi và đi ngoài phân đen nát",
        "B. Nhiệt độ cơ thể tăng lên {temp}",
        "C. Cảm giác đau âm ỉ vùng thượng vị tăng lên",
        "D. Chỉ số SpO2 tăng lên mức {spo2}"
      ],
      ans: "A",
      exp: "Dấu hiệu sinh tồn biến động (huyết áp tụt, mạch nhanh), kèm vã mồ hôi, da tái lạnh và tính chất phân đen nát là các dấu hiệu chỉ điểm trực tiếp tình trạng xuất huyết tiêu hóa đang tiếp diễn nặng nề."
    },
    {
      category: "Cấp cứu & Hồi sức nâng cao",
      q: "Khi phụ giúp bác sĩ đặt nội khí quản cho người bệnh {name} bị suy hô hấp nguy kịch, thời gian tối đa cho mỗi lần thử luồn ống nội khí quản là bao lâu để tránh thiếu oxy não?",
      opt: [
        "A. Không quá 30 giây",
        "B. Không quá 60 giây",
        "C. Không quá 90 giây",
        "D. Không quá 2 phút"
      ],
      ans: "A",
      exp: "Mỗi lần nỗ lực đặt nội khí quản không được kéo dài quá 30 giây. Nếu thất bại, phải dừng lại và thông khí bằng bóp bóng qua mặt nạ oxy 100% trước khi thử lại."
    },
    {
      category: "Chăm sóc Ngoại khoa & Chấn thương",
      q: "Người bệnh {name}, {age} tuổi, sau chấn thương sọ não đang nằm điều trị. Điều dưỡng quan sát thấy người bệnh lơ mơ, đồng tử một bên giãn to hơn bên còn lại. Nhận định nào sau đây là khẩn cấp nhất?",
      opt: [
        "A. Dấu hiệu tăng áp lực nội sọ cấp tính do tụ máu nội sọ",
        "B. Triệu chứng động kinh cục bộ",
        "C. Biểu hiện tai biến mạch máu não thoáng qua",
        "D. Người bệnh đang ngủ sâu giấc sinh lý"
      ],
      ans: "A",
      exp: "Tri giác giảm dần kết hợp đồng tử hai bên không đều (giãn một bên) là dấu hiệu kinh điển của tăng áp lực nội sọ cực kỳ nguy hiểm, đe dọa thoát vị não, cần báo cấp cứu phẫu thuật ngay."
    },
    {
      category: "Chăm sóc Sản khoa & Phụ khoa",
      q: "Trong quá trình theo dõi chuyển dạ cho thai phụ {name}, điều dưỡng phát hiện nhịp tim thai đột ngột sụt giảm kéo dài xuống dưới 100 lần/phút sau mỗi cơn co. Can thiệp đầu tiên cần làm là gì?",
      opt: [
        "A. Cho sản phụ nằm nghiêng trái, thở oxy qua mặt nạ và báo ngay cho bác sĩ",
        "B. Hướng dẫn sản phụ rặn đẻ ngay lập tức",
        "C. Cho sản phụ uống nước đường để tăng nhịp tim thai",
        "D. Tiếp tục theo dõi thêm 3 cơn co nữa"
      ],
      ans: "A",
      exp: "Nhịp giảm muộn tim thai biểu hiện suy thai cấp tính do thiếu oxy bánh nhau. Tư thế nằm nghiêng trái giúp giảm đè ép tử cung lên tĩnh mạch chủ dưới, cải thiện tuần hoàn nhau thai cứu thai nhi."
    },
    {
      category: "Chăm sóc Nhi khoa",
      q: "Khi thực hiện chiếu đèn điều trị vàng da tăng bilirubin gián tiếp cho trẻ sơ sinh con bà {name}, việc bảo vệ bộ phận nào của trẻ là bắt buộc?",
      opt: [
        "A. Bịt kín mắt và che bộ phận sinh dục của trẻ",
        "B. Che kín vùng ngực và bụng của trẻ",
        "C. Băng kín hai lòng bàn tay và bàn chân",
        "D. Che kín vùng rốn của trẻ sơ sinh"
      ],
      ans: "A",
      exp: "Ánh sáng liệu pháp chiếu đèn có thể gây tổn thương võng mạc mắt và ảnh hưởng đến tuyến sinh dục của trẻ, do đó bắt buộc phải băng mắt và che vùng sinh dục cẩn thận trong suốt quá trình chiếu đèn."
    },
    {
      category: "Kiểm soát nhiễm khuẩn & Vệ sinh",
      q: "Thời gian lưu trữ tối đa cho phép đối với các dụng cụ y tế đã được đóng gói và tiệt khuẩn bằng phương pháp hấp ướt Autoclave tiêu chuẩn (sử dụng túi giấy-nilon chuyên dụng) trong điều kiện khô ráo là bao lâu?",
      opt: [
        "A. 1 tháng",
        "B. 1 tuần",
        "C. 3 tháng",
        "D. 6 tháng"
      ],
      ans: "A",
      exp: "Dụng cụ đóng gói trong túi chuyên dụng hấp autoclave tiêu chuẩn bảo quản khô ráo, sạch sẽ có hạn sử dụng an toàn thông thường trong vòng 1 tháng (30 ngày)."
    },
    {
      category: "An toàn người bệnh & Quản lý sự cố",
      q: "Nguyên tắc '5 đúng' trong dùng thuốc cho người bệnh luôn là kim chỉ nam cho điều dưỡng. '5 đúng' bao gồm những nội dung nào?",
      opt: [
        "A. Đúng người bệnh, Đúng thuốc, Đúng liều, Đúng đường dùng, Đúng thời gian",
        "B. Đúng người bệnh, Đúng phòng bệnh, Đúng thuốc, Đúng liều, Đúng bác sĩ y lệnh",
        "C. Đúng bệnh nhân, Đúng thuốc, Đúng giá tiền, Đúng giờ tiêm, Đúng y tá thực hiện",
        "D. Đúng người bệnh, Đúng thuốc, Đúng liều, Đúng hạn sử dụng, Đúng kết quả xét nghiệm"
      ],
      ans: "A",
      exp: "Quy tắc 5 đúng kinh điển bao gồm: Đúng người bệnh (Right patient), Đúng thuốc (Right drug), Đúng liều lượng (Right dose), Đúng đường dùng (Right route), Đúng thời gian (Right time)."
    },
    {
      category: "Quy tắc ứng xử & Đạo đức nghề nghiệp",
      q: "Khi bệnh nhân {name} lớn tuổi có hành vi to tiếng, khiếu nại gay gắt với điều dưỡng vì phải chờ đợi lâu tại phòng khám, thái độ ứng xử chuyên nghiệp nhất của điều dưỡng là:",
      opt: [
        "A. Lắng nghe ôn hòa, giải thích lý do khách quan và hướng dẫn hỗ trợ giải quyết nhanh thủ tục",
        "B. To tiếng lại để bảo vệ danh dự bản thân",
        "C. Bỏ đi không tiếp chuyện để tránh xung đột",
        "D. Báo bảo vệ đến cưỡng chế bệnh nhân ra ngoài"
      ],
      ans: "A",
      exp: "Quy tắc ứng xử y tế yêu cầu nhân viên luôn giữ thái độ bình tĩnh, lắng nghe, thấu hiểu khó khăn của người bệnh, ôn hòa giải thích rõ ràng và tích cực hỗ trợ giải tỏa bức xúc."
    },
    {
      category: "Điều dưỡng Nội khoa",
      q: "Người bệnh {name}, {age} tuổi, có tiền sử tăng huyết áp đột ngột xuất hiện đau đầu dữ dội, liệt nửa người bên trái và nói ngọng. Huyết áp đo được là {bp}. Việc cần làm ngay là gì?",
      opt: [
        "A. Đặt người bệnh nằm đầu cao 30 độ, giữ yên tĩnh tuyệt đối và báo bác sĩ cấp cứu chụp CT não",
        "B. Cho người bệnh uống ngay một cốc nước chanh ấm nóng",
        "C. Thực hiện xoa bóp bấm huyệt vùng đầu cổ để giảm đau",
        "D. Cho người bệnh tự uống thuốc hạ huyết áp nhanh dưới lưỡi"
      ],
      ans: "A",
      exp: "Triệu chứng gợi ý tai biến mạch máu não cấp. Cần cho nằm yên tĩnh đầu cao nhẹ phòng trào ngược, tránh vận động mạnh gây xuất huyết lan rộng và khẩn trương chụp CT để phân biệt thể bệnh."
    },
    {
      category: "Cấp cứu & Hồi sức nâng cao",
      q: "Khi truyền máu cho người bệnh {name}, điều dưỡng phát hiện sau 15 phút đầu người bệnh rét run, sốt cao {temp}, mạch nhanh {hr}, huyết áp tụt. Việc xử trí đầu tiên lập tức là gì?",
      opt: [
        "A. Ngừng truyền máu ngay lập tức, giữ đường truyền tĩnh mạch bằng nước muối sinh lý và báo bác sĩ",
        "B. Giảm tốc độ truyền máu xuống thật chậm và đắp chăn ấm cho người bệnh",
        "C. Tiêm ngay một ống kháng histamin vào đường truyền máu",
        "D. Chờ theo dõi thêm 15 phút xem phản ứng có tự hết không"
      ],
      ans: "A",
      exp: "Biểu hiện tai biến truyền máu cấp tính nguy hiểm. Phải ngừng ngay dòng máu truyền lập tức để ngăn dị nguyên vào cơ thể, giữ đường truyền bằng NaCl 0.9% để dùng thuốc cấp cứu."
    },
    {
      category: "Chăm sóc Ngoại khoa & Chấn thương",
      q: "Sau phẫu thuật cắt dạ dày, người bệnh {name} được đặt ống thông dạ dày hút liên tục. Điều dưỡng phát hiện ống thông không ra dịch và bụng người bệnh chướng nề. Việc đầu tiên nên làm là:",
      opt: [
        "A. Kiểm tra vị trí ống, bơm rửa nhẹ nhàng ống thông bằng nước muối sinh lý vô khuẩn",
        "B. Rút ống thông dạ dày ra ngay lập tức và đặt lại",
        "C. Tăng áp lực máy hút lên mức tối đa",
        "D. Báo bác sĩ mổ cấp cứu lại"
      ],
      ans: "A",
      exp: "Bụng chướng và ống thông không hoạt động thường do tắc nghẽn cục máu đông hoặc dịch thức ăn dính. Cần kiểm tra kỹ vị trí và bơm rửa nhẹ nhàng bằng nước muối sinh lý vô khuẩn để thông ống."
    }
  ];

  const generated: Question[] = [];

  for (let id = startId; id <= endId; id++) {
    // Select template based on id
    const tIdx = (id - startId) % templates.length;
    const t = templates[tIdx];

    // Generate deterministic values based on id
    const name = NAMES[id % NAMES.length];
    const age = AGES[id % AGES.length];
    const bp = `${130 + (id % 5) * 10}/${80 + (id % 3) * 10} mmHg`;
    const temp = `${38.2 + (id % 4) * 0.4} °C`;
    const hr = `${90 + (id % 6) * 5} lần/phút`;
    const spo2 = `${90 + (id % 5)}%`;

    // Perform replacements
    let qText = t.q
      .replace(/{name}/g, name)
      .replace(/{age}/g, String(age))
      .replace(/{bp}/g, bp)
      .replace(/{temp}/g, temp)
      .replace(/{hr}/g, hr)
      .replace(/{spo2}/g, spo2);

    generated.push({
      id: id,
      question: qText,
      options: t.opt,
      answer: t.ans,
      category: t.category,
      explanation: t.exp
    });
  }
  return generated;
}

// Check if we need to supplement up to 800 questions
const parsedCount = allQuestions.length;
console.log(`Currently have ${parsedCount} questions.`);

// Write the database file
async function main() {
  fs.writeFileSync(outputPath, JSON.stringify(allQuestions, null, 2), 'utf-8');
  console.log(`Saved ${allQuestions.length} questions to ${outputPath} successfully!`);
}

main();
