import React, { useState, useEffect } from "react";
import axios from "axios";
import { buildUrl, API_ENDPOINTS } from "../config/api";
import { useBusiness } from "../context/BusinessContext";

// Utility to strip HTML and show clean text
const htmlToPlainText = (html) => {
  if (!html) return "";

  let text = html;

  // Remove DOCTYPE and html/head/body tags
  text = text.replace(/<!DOCTYPE[^>]*>/gi, "");
  text = text.replace(/<html[^>]*>/gi, "");
  text = text.replace(/<\/html>/gi, "");
  text = text.replace(/<head[^>]*>[\s\S]*?<\/head>/gi, "");
  text = text.replace(/<body[^>]*>/gi, "");
  text = text.replace(/<\/body>/gi, "");

  // Convert block elements to line breaks
  text = text.replace(/<\/p>/gi, "\n\n");
  text = text.replace(/<\/div>/gi, "\n\n");
  text = text.replace(/<\/h[1-6]>/gi, "\n\n");
  text = text.replace(/<\/tr>/gi, "\n");
  text = text.replace(/<\/li>/gi, "\n");
  text = text.replace(/<br\s*\/?>/gi, "\n");

  // Remove all remaining HTML tags
  text = text.replace(/<[^>]+>/g, "");

  // Decode HTML entities
  text = text.replace(/&nbsp;/g, " ");
  text = text.replace(/&amp;/g, "&");
  text = text.replace(/&lt;/g, "<");
  text = text.replace(/&gt;/g, ">");
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");

  // Clean up extra whitespace
  text = text.replace(/\n\s*\n\s*\n/g, "\n\n");
  text = text.replace(/[ \t]+/g, " ");
  text = text.trim();

  return text;
};

const isHtmlContent = (content) => {
  if (!content) return false;
  const trimmed = content.trim();
  return (
    trimmed.includes("<html") ||
    trimmed.includes("<!DOCTYPE") ||
    trimmed.includes("<body") ||
    trimmed.includes("<div") ||
    trimmed.includes("<p") ||
    trimmed.includes("<table")
  );
};

// Format plain text to HTML for preview
const formatTextForPreview = (text) => {
  if (!text) return "";

  // If already HTML, return as-is
  if (isHtmlContent(text)) {
    return text;
  }

  // Convert plain text to HTML paragraphs
  const paragraphs = text.split("\n\n");
  return paragraphs
    .map((para) => {
      if (!para.trim()) return "";
      // Replace single newlines with <br>
      const formatted = para.trim().replace(/\n/g, "<br>");
      return `<p style="margin: 0 0 15px 0;">${formatted}</p>`;
    })
    .join("\n");
};

const EmailTemplateVisualEditor = ({ template, onSave, onCancel }) => {
  const { selectedBusiness } = useBusiness();
  const [activeTab, setActiveTab] = useState("content"); // 'content' or 'styling'
  const [loading, setLoading] = useState(false);
  const [orgStyle, setOrgStyle] = useState(null);
  const [previewHtml, setPreviewHtml] = useState("");

  // Content state
  const [content, setContent] = useState({
    name: template?.name || "",
    subject: template?.subject || "",
    body: template?.body
      ? isHtmlContent(template.body)
        ? htmlToPlainText(template.body)
        : template.body
      : "",
    type: template?.type || "INITIAL_REQUEST",
  });

  // Styling state (organization-level)
  const [styling, setStyling] = useState({
    logoUrl: "",
    logoSize: "SMALL",
    logoPosition: "LEFT",
    showBusinessName: true,
    businessNamePosition: "CENTER",
    customImageUrl: "",
    showCustomImage: false,
    textAlignment: "LEFT",
    buttonText: "Leave Feedback",
    buttonAlignment: "CENTER",
    buttonStyle: "ROUNDED",
    buttonColor: "#00D682",
    backgroundColor: "#F2F2F7",
    containerBackgroundColor: "#FFFFFF",
    containerCorners: "ROUNDED",
    primaryColor: "#00D682",
    secondaryColor: "#333333",
    textColor: "#333333",
  });

  // Preview data
  const [previewData, setPreviewData] = useState({
    customerName: "John Smith",
    businessName: selectedBusiness?.name || "ABC Home Services",
    serviceType: "Kitchen Sink Repair",
    serviceDate: "2025-01-15",
    businessPhone: selectedBusiness?.phone || "(555) 123-4567",
    businessWebsite: selectedBusiness?.website || "www.abchomeservices.com",
    privateFeedbackUrl: "https://reputul.com/feedback/123",
    unsubscribeUrl: "https://reputul.com/unsubscribe/123",
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  // Fetch organization styling on mount
  useEffect(() => {
    fetchOrganizationStyle();
  }, []);

  // Update content when template changes (for editing existing templates)
  useEffect(() => {
    if (template) {
      setContent({
        name: template.name || "",
        subject: template.subject || "",
        body: template.body
          ? isHtmlContent(template.body)
            ? htmlToPlainText(template.body)
            : template.body
          : "",
        type: template.type || "INITIAL_REQUEST",
      });
    }
  }, [template]);

  // Generate preview whenever content or styling changes
  useEffect(() => {
    generatePreview();
  }, [content, styling, previewData]);

  const fetchOrganizationStyle = async () => {
    try {
      const response = await axios.get(
        buildUrl("/api/v1/email-template-styles"),
        { headers: getAuthHeaders() }
      );
      setOrgStyle(response.data);
      setStyling(response.data);
    } catch (error) {
      console.error("Error fetching organization style:", error);
    }
  };

  useEffect(() => {
    if (selectedBusiness) {
      setPreviewData((prev) => ({
        ...prev,
        businessName: selectedBusiness.name,
        businessPhone: selectedBusiness.phone || prev.businessPhone,
        businessWebsite: selectedBusiness.website || prev.businessWebsite,
      }));
    }
  }, [selectedBusiness]);

  const generatePreview = () => {
    // Generate a simple preview HTML based on current state
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: ${
        styling.backgroundColor
      };">
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: ${
          styling.backgroundColor
        }; min-height: 100%;">
          <tr>
            <td align="center" style="padding: 40px 20px;">
              <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; background-color: ${
                styling.containerBackgroundColor
              }; border-radius: ${
      styling.containerCorners === "ROUNDED" ? "12px" : "0"
    };">
                
                <!-- Header -->
                <tr>
                  <td style="padding: 40px 30px; text-align: ${styling.businessNamePosition.toLowerCase()}; border-bottom: 1px solid #e0e0e0;">
                    ${
                      styling.logoUrl
                        ? `
                      <div style="text-align: ${styling.logoPosition.toLowerCase()}; margin-bottom: ${
                            styling.showBusinessName ? "15px" : "0"
                          };">
                        <img src="${
                          styling.logoUrl
                        }" alt="Logo" style="max-width: ${getLogoSize(
                            styling.logoSize
                          )}; height: auto;" />
                      </div>
                    `
                        : ""
                    }
                    ${
                      styling.showBusinessName
                        ? `
                      <h1 style="margin: 0; font-size: 28px; color: ${styling.primaryColor};">${previewData.businessName}</h1>
                    `
                        : ""
                    }
                  </td>
                </tr>

                ${
                  styling.showCustomImage && styling.customImageUrl
                    ? `
                <!-- Custom Image -->
                <tr>
                  <td style="padding: 0;">
                    <img src="${styling.customImageUrl}" alt="" style="width: 100%; height: auto; display: block;" />
                  </td>
                </tr>
                `
                    : ""
                }

                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px; text-align: ${styling.textAlignment.toLowerCase()};">
                    <div style="color: ${
                      styling.textColor
                    }; font-size: 16px; line-height: 1.6;">
                      ${formatTextForPreview(
                        replaceVariables(content.body, previewData)
                      )}
                    </div>
                  </td>
                </tr>

                <!-- Button -->
                <tr>
                  <td style="padding: 0 30px 40px 30px; text-align: ${styling.buttonAlignment.toLowerCase()};">
                    <a href="${
                      previewData.privateFeedbackUrl
                    }" style="display: inline-block; background-color: ${
      styling.buttonColor
    }; color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: ${
      styling.buttonStyle === "PILL" ? "50px" : "8px"
    }; font-weight: bold; font-size: 18px;">
                      ${styling.buttonText}
                    </a>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8f9fa; padding: 25px 30px; border-top: 1px solid #e0e0e0; text-align: center;">
                    <p style="margin: 0 0 5px 0; font-size: 14px; color: #666;">${
                      previewData.businessPhone
                    }</p>
                    <p style="margin: 0 0 15px 0; font-size: 14px; color: #666;">${
                      previewData.businessWebsite
                    }</p>
                    <p style="margin: 0; font-size: 12px; color: #999;">
                      <a href="${
                        previewData.unsubscribeUrl
                      }" style="color: #666; text-decoration: none;">Unsubscribe</a>
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
    setPreviewHtml(html);
  };

  const replaceVariables = (text, data) => {
    if (!text) return "";
    let result = text;
    Object.keys(data).forEach((key) => {
      result = result.replace(new RegExp(`{{${key}}}`, "g"), data[key] || "");
    });
    return result;
  };

  const getLogoSize = (size) => {
    switch (size) {
      case "SMALL":
        return "120px";
      case "MEDIUM":
        return "180px";
      case "LARGE":
        return "240px";
      default:
        return "120px";
    }
  };

  const handleSaveStyling = async () => {
    try {
      setLoading(true);
      await axios.put(buildUrl("/api/v1/email-template-styles"), styling, {
        headers: getAuthHeaders(),
      });
      alert("Styling saved successfully!");
    } catch (error) {
      console.error("Error saving styling:", error);
      alert("Failed to save styling");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplate = async () => {
    try {
      setLoading(true);
      const templateData = {
        ...content,
        simplifiedMode: true,
        buttonUrlType: "FEEDBACK_GATE",
        showMultiplePlatforms: false,
      };

      if (template?.id) {
        await onSave(template.id, templateData);
      } else {
        await onSave(null, templateData);
      }
    } catch (error) {
      console.error("Error saving template:", error);
      alert("Failed to save template");
    } finally {
      setLoading(false);
    }
  };

  const insertVariable = (variable) => {
    const textarea = document.getElementById("template-body");
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const newText =
      text.substring(0, start) + `{{${variable}}}` + text.substring(end);

    setContent((prev) => ({ ...prev, body: newText }));

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + variable.length + 4,
        start + variable.length + 4
      );
    }, 0);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white px-6 pt-6">
        <button
          onClick={() => setActiveTab("content")}
          className={`px-8 py-3 font-medium text-sm rounded-t-lg transition-colors ${
            activeTab === "content"
              ? "bg-black text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          CONTENT
        </button>
        <button
          onClick={() => setActiveTab("styling")}
          className={`ml-2 px-8 py-3 font-medium text-sm rounded-t-lg transition-colors ${
            activeTab === "styling"
              ? "bg-black text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          STYLING
        </button>
      </div>

      <div className="flex-1 overflow-hidden flex">
        {/* Editor Panel */}
        <div className="w-1/2 overflow-y-auto bg-white p-6 border-r border-gray-200">
          {activeTab === "content" ? (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  💡 <strong>Tip:</strong> Your styling settings are shared
                  across all templates. Set your brand once in the STYLING tab,
                  then focus on your message here.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Name
                </label>
                <input
                  type="text"
                  value={content.name}
                  onChange={(e) =>
                    setContent((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., Initial Review Request"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Type
                </label>
                <select
                  value={content.type}
                  onChange={(e) =>
                    setContent((prev) => ({ ...prev, type: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="INITIAL_REQUEST">Initial Request</option>
                  <option value="FOLLOW_UP_3_DAY">3-Day Follow-up</option>
                  <option value="FOLLOW_UP_7_DAY">7-Day Follow-up</option>
                  <option value="FOLLOW_UP_14_DAY">14-Day Follow-up</option>
                  <option value="THANK_YOU">Thank You</option>
                  <option value="CUSTOM">Custom</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Subject Line
                </label>
                <input
                  type="text"
                  value={content.subject}
                  onChange={(e) =>
                    setContent((prev) => ({ ...prev, subject: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., How was your experience?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Content
                </label>
                <textarea
                  id="template-body"
                  value={content.body}
                  onChange={(e) =>
                    setContent((prev) => ({ ...prev, body: e.target.value }))
                  }
                  rows="12"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                  placeholder="Hi {{customerName}},

Thank you for choosing {{businessName}} for your {{serviceType}}.

We hope you were satisfied with our service. Please take a moment to share your feedback.

Thanks!"
                />
                <p className="mt-2 text-sm text-gray-600">
                  💡 <strong>Tip:</strong> Just type normally - we'll make it
                  look beautiful automatically! Use variables like{" "}
                  {"{{customerName}}"} for personalization.
                </p>
              </div>

              {/* Variable Buttons */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Insert Variables
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    "customerName",
                    "businessName",
                    "serviceType",
                    "serviceDate",
                    "businessPhone",
                    "businessWebsite",
                  ].map((variable) => (
                    <button
                      key={variable}
                      type="button"
                      onClick={() => insertVariable(variable)}
                      className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-md font-mono"
                    >
                      {"{{" + variable + "}}"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-purple-800">
                  🎨 <strong>Brand Styling:</strong> These settings apply to all
                  your email templates. Set your brand once and it'll be
                  consistent across all campaigns.
                </p>
              </div>

              {/* Logo & Business Name */}
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  LOGO & BUSINESS NAME
                </h3>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Logo
                    </label>
                    <input
                      type="text"
                      value={styling.logoUrl}
                      onChange={(e) =>
                        setStyling((prev) => ({
                          ...prev,
                          logoUrl: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="https://example.com/logo.png"
                    />
                  </div>

                  {/* Logo Size */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      LOGO SIZE
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {["SMALL", "MEDIUM", "LARGE"].map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() =>
                            setStyling((prev) => ({ ...prev, logoSize: size }))
                          }
                          className={`px-3 py-2 text-xs border rounded-lg ${
                            styling.logoSize === size
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {size.charAt(0) + size.slice(1).toLowerCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Logo Position */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      LOGO POSITION
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {["LEFT", "CENTER", "RIGHT"].map((pos) => (
                        <button
                          key={pos}
                          type="button"
                          onClick={() =>
                            setStyling((prev) => ({
                              ...prev,
                              logoPosition: pos,
                            }))
                          }
                          className={`px-3 py-2 text-xs border rounded-lg ${
                            styling.logoPosition === pos
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {pos.charAt(0) + pos.slice(1).toLowerCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id="showBusinessName"
                    checked={styling.showBusinessName}
                    onChange={(e) =>
                      setStyling((prev) => ({
                        ...prev,
                        showBusinessName: e.target.checked,
                      }))
                    }
                    className="mr-2"
                  />
                  <label
                    htmlFor="showBusinessName"
                    className="text-sm font-medium text-gray-700"
                  >
                    Show Business Name
                  </label>
                </div>

                {/* BRAND COLOR - Controls both business name and button */}
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    🎨 BRAND COLOR
                  </label>
                  <div className="flex items-center gap-3 mb-2">
                    <input
                      type="color"
                      value={styling.primaryColor}
                      onChange={(e) =>
                        setStyling((prev) => ({
                          ...prev,
                          primaryColor: e.target.value,
                          buttonColor: e.target.value,
                        }))
                      }
                      className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={styling.primaryColor}
                      onChange={(e) =>
                        setStyling((prev) => ({
                          ...prev,
                          primaryColor: e.target.value,
                          buttonColor: e.target.value,
                        }))
                      }
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="#00D682"
                    />
                  </div>
                  <p className="text-xs text-blue-800">
                    Sets your brand color for header font and button background
                  </p>
                </div>
              </div>

              {/* Custom Image */}
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  IMAGE OPTIONS
                </h3>

                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="showCustomImage"
                    checked={styling.showCustomImage}
                    onChange={(e) =>
                      setStyling((prev) => ({
                        ...prev,
                        showCustomImage: e.target.checked,
                      }))
                    }
                    className="mr-2"
                  />
                  <label
                    htmlFor="showCustomImage"
                    className="text-sm font-medium text-gray-700"
                  >
                    Show Custom Image
                  </label>
                </div>

                {styling.showCustomImage && (
                  <input
                    type="text"
                    value={styling.customImageUrl}
                    onChange={(e) =>
                      setStyling((prev) => ({
                        ...prev,
                        customImageUrl: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="https://example.com/image.png"
                  />
                )}
              </div>

              {/* Text Alignment */}
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  TEXT ALIGNMENT
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {["LEFT", "CENTER", "RIGHT"].map((align) => (
                    <button
                      key={align}
                      type="button"
                      onClick={() =>
                        setStyling((prev) => ({
                          ...prev,
                          textAlignment: align,
                        }))
                      }
                      className={`px-3 py-2 text-sm border rounded-lg ${
                        styling.textAlignment === align
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {align === "LEFT" ? "≡" : align === "CENTER" ? "☰" : "≡"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Button Style */}
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  BUTTON STYLE
                </h3>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Button Text
                  </label>
                  <input
                    type="text"
                    value={styling.buttonText}
                    onChange={(e) =>
                      setStyling((prev) => ({
                        ...prev,
                        buttonText: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      BUTTON STYLE
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {["ROUNDED", "PILL"].map((style) => (
                        <button
                          key={style}
                          type="button"
                          onClick={() =>
                            setStyling((prev) => ({
                              ...prev,
                              buttonStyle: style,
                            }))
                          }
                          className={`px-3 py-2 text-xs border ${
                            style === "ROUNDED" ? "rounded-lg" : "rounded-full"
                          } ${
                            styling.buttonStyle === style
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {style === "ROUNDED" ? "◻ Rounded" : "◉ Pill"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      BUTTON ALIGNMENT
                    </label>
                    <div className="grid grid-cols-3 gap-1">
                      {["LEFT", "CENTER", "RIGHT"].map((align) => (
                        <button
                          key={align}
                          type="button"
                          onClick={() =>
                            setStyling((prev) => ({
                              ...prev,
                              buttonAlignment: align,
                            }))
                          }
                          className={`px-2 py-2 text-xs border rounded ${
                            styling.buttonAlignment === align
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {align.charAt(0)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Background Color */}
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  BACKGROUND COLOR
                </h3>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={styling.backgroundColor}
                    onChange={(e) =>
                      setStyling((prev) => ({
                        ...prev,
                        backgroundColor: e.target.value,
                      }))
                    }
                    className="h-10 w-20 rounded border border-gray-300"
                  />
                  <input
                    type="text"
                    value={styling.backgroundColor}
                    onChange={(e) =>
                      setStyling((prev) => ({
                        ...prev,
                        backgroundColor: e.target.value,
                      }))
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded"
                    placeholder="#F2F2F7"
                  />
                </div>
              </div>

              {/* Container Corners */}
              <div className="pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  CONTAINER CORNERS
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {["ROUNDED", "SHARP"].map((corner) => (
                    <button
                      key={corner}
                      type="button"
                      onClick={() =>
                        setStyling((prev) => ({
                          ...prev,
                          containerCorners: corner,
                        }))
                      }
                      className={`px-4 py-3 border ${
                        corner === "ROUNDED" ? "rounded-lg" : "rounded-none"
                      } ${
                        styling.containerCorners === corner
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {corner === "ROUNDED" ? "◻ Rounded" : "□ Sharp"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Preview Panel */}
        <div className="w-1/2 bg-gray-50 overflow-y-auto p-6">
          <div className="sticky top-0 bg-gray-50 pb-4 mb-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Live Preview
            </h3>
            <p className="text-sm text-gray-600">
              See how your email will look to customers
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <iframe
              srcDoc={previewHtml}
              className="w-full h-screen border-0"
              title="Email Preview"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white border-t border-gray-200 px-6 py-4 flex justify-between">
        <button
          onClick={onCancel}
          className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
        >
          Cancel
        </button>
        <div className="flex gap-3">
          {activeTab === "styling" && (
            <button
              onClick={handleSaveStyling}
              disabled={loading}
              className="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium disabled:opacity-50"
            >
              {loading ? "Saving Styling..." : "Save Styling"}
            </button>
          )}
          {activeTab === "content" && (
            <button
              onClick={handleSaveTemplate}
              disabled={loading}
              className="px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium disabled:opacity-50"
            >
              {loading ? "Saving Template..." : "Save Template"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailTemplateVisualEditor;
