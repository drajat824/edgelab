import React from "react";
import ManualBook from "../assets/files/manual_book.pdf";
import Jobsheet_1 from "../assets/files/Jobsheet_1.pdf";
import Jobsheet_2 from "../assets/files/Jobsheet_2.pdf";
import Jobsheet_3 from "../assets/files/Jobsheet_3.pdf";
import Training_Model from "../assets/files/Training_Model.ipynb";

export default function LearningResource() {
  const handleDownload = (fileUrl, fileName) => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Data sumber belajar agar kodenya lebih rapi dan modular
  const resources = [
    {
      id: "manual-book",
      category: "Guide Book",
      title: "Manual Book Trainer Kit",
      description: "Guide book to using the trainer kit.",
      fileUrl: ManualBook,
      fileName: "ManualBook.pdf",
      badgeColor: "bg-blue-100 text-blue-700 dark:bg-blue-700/40",
      fileType: "PDF",
    },
    {
      id: "notebook-colab",
      category: "Notebook",
      title: "Notebook Training (Google Colab)",
      description: "Jupyter Notebook template file (.ipynb) for experiments in Google Colab.",
      fileUrl: Training_Model,
      fileName: "Training_Model.ipynb",
      badgeColor: "bg-amber-100 text-amber-700 dark:bg-amber-700/40",
      fileType: "IPYNB",
    },
    {
      id: "jobsheet-1",
      category: "Jobsheet",
      title: "Jobsheet 1",
      description: "Introduction to Edge Computing and Object Detection Training Devices.",
      fileUrl: Jobsheet_1,
      fileName: "Jobsheet_1.pdf",
      badgeColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-700/30",
      fileType: "PDF",
    },
    {// Ganti dengan variabel impor Jobsheet 2
      id: "jobsheet-2",
      category: "Jobsheet",
      title: "Jobsheet 2",
      description: "CPU Resource Management for Inference Processes Edge AI.",
      fileUrl: Jobsheet_2,
      fileName: "Jobsheet_2.pdf",
      badgeColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-700/30",
      fileType: "PDF",
    },
    {
      id: "jobsheet-3",
      category: "Jobsheet",
      title: "Jobsheet 3",
      description: "Fine-Tuning SSD-MobileNet V2 FPN and Evaluation Object Detection on Edge Devices.",
      fileUrl: Jobsheet_3,
      fileName: "Jobsheet_3.pdf",
      badgeColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-700/30",
      fileType: "PDF",
    }
  ];

  return (
    <div className="parent overflow-x-hidden">
      <h1 className="text-xtitle">Learning Resources</h1>
      <p className="text-subinfo mt-2 text-gray-500 pb-5">Learning resources for student practical activities.</p>

      {/* Grid Cards Resource */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map((item) => (
          <div key={item.id} className="flex flex-col justify-between bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 p-5">
            <div>
              {/* Card Header: Badge & File Type */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${item.badgeColor}`}>{item.category}</span>
                <span className="text-xs font-mono font-medium text-gray-400 uppercase">{item.fileType}</span>
              </div>

              {/* Title & Description */}
              <h3 className="text-lg font-bold text-gray-900 line-clamp-2">{item.title}</h3>
              <p className="mt-2 text-sm text-gray-600 line-clamp-3 leading-relaxed">{item.description}</p>
            </div>

            {/* Action Area / Download Button */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <button onClick={() => handleDownload(item.fileUrl, item.fileName)} className="btn w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-sm rounded-lg transition-colors duration-150 shadow-sm cursor-pointer">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download {item.fileType}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
