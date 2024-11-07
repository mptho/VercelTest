export default function handler(req, res) {
  // Lấy domain từ header của yêu cầu và thêm protocol 'https://'
  const domain = `https://${req.headers.host}`; 
  res.status(200).json({ domain: domain });
}
