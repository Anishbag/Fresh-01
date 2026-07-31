import Employee from "../../models/Employee.js";
import Mail from "../../models/Mail.js";
import transporter from "../../config/mailer.js";

export const sendMail = async (req, res) => {
  try {
    const { employee, subject, message } = req.body;

    const emp = await Employee.findById(employee);

    if (!emp) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: emp.email,
      subject,
      text: message,
    };

    if (req.file) {
      mailOptions.attachments = [
        {
          filename: req.file.originalname,
          path: req.file.path,
        },
      ];
    }

    await transporter.sendMail(mailOptions);

    const history = await Mail.create({
      employee: emp._id,
      subject,
      message,
      attachment: req.file ? req.file.filename : "",
      sentBy: req.user._id,
    });

    res.status(200).json({
      success: true,
      message: "Mail sent successfully",
      history,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const getMailHistory = async (req, res) => {
  try {
    const mails = await Mail.find()
      .populate("employee", "fullName email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      mails,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};