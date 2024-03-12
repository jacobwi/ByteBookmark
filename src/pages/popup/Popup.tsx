import { MemoryRouter as Router, Routes, Route, Link } from "react-router-dom";
import { LoginPage, HomePage, SignupPage, Select, InputField } from "shared/ui";
import { ProtectedRoute } from "shared/routes";
import { AuthProvider } from "shared/contexts/AuthContext";
import { BookmarkProvider } from "shared/contexts/BookmarkContext";
import {
  IoHomeOutline,
  IoSettingsOutline,
  IoBookmarkOutline,
  IoAddCircleOutline,
  IoLogOutOutline,
  IoClose,
  IoRemove,
  IoSquareOutline,
} from "react-icons/io5";
import { useEffect, useState } from "react";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";

export default function Popup(): JSX.Element {
  return (
    <AuthProvider>
      <BookmarkProvider>
        <Router>
          <Routes>
            <Route
              path="/login"
              element={
                <Layout>
                  <LoginPage />
                </Layout>
              }
            />
            <Route
              path="/register"
              element={
                <Layout>
                  <SignupPage />
                </Layout>
              }
            />
            <Route
              path="/dashboard"
              element={<LayoutWithPrivateRoute component={HomePage} />}
            />
            <Route
              path="/"
              element={<LayoutWithPrivateRoute component={HomePage} />}
            />

            <Route
              path="/bookmarks/add"
              element={<LayoutWithPrivateRoute component={AddBookmarkForm} />}
            />
            <Route
              path="/bookmarks"
              element={<LayoutWithPrivateRoute component={BookmarksPage} />}
            />
            <Route
              path="/settings"
              element={<LayoutWithPrivateRoute component={Settings} />}
            />
          </Routes>
        </Router>
      </BookmarkProvider>
    </AuthProvider>
  );
}

const LayoutWithPrivateRoute = ({
  component: Component,
}: {
  component: React.ComponentType;
}) => {
  return (
    <ProtectedRoute>
      <Layout>
        <Component />
      </Layout>
    </ProtectedRoute>
  );
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  const handleClose = () => {
    // Implement the close functionality, e.g., window.close() for a browser window
    console.log("Close window");
  };

  const handleMinimize = () => {
    // Implement the minimize functionality, this might be specific to your application or platform
    console.log("Minimize window");
  };

  const handleExport = () => {
    // Get the current extension's manifest
    const manifest = chrome.runtime.getManifest();

    // Extract the popup's HTML file path from the manifest
    const popupPath = manifest?.action?.default_popup;

    if (popupPath) {
      // Get the full URL of the popup page
      const popupUrl = chrome.runtime.getURL(popupPath);

      // Open the popup content in a new window
      chrome.windows.create(
        {
          focused: true,
          setSelfAsOpener: true,
          url: popupUrl,
          type: "popup", // Or 'normal', depending on your preference
        },
        (newWindow) => {
          // Check if the new window was created successfully
          if (newWindow?.id) {
            // Use executeScript to run a script in the context of the new window
            // to get its content dimensions
            chrome.scripting.executeScript(
              {
                target: { tabId: newWindow.tabs?.[0]?.id ?? 0 },
                function: () => {
                  return {
                    width: document.documentElement.clientWidth,
                    height: document.documentElement.scrollHeight,
                  };
                },
              },
              (results) => {
                // Check if we got a result
                if (results && results.length > 0) {
                  const dimensions = results[0].result as {
                    width: number;
                    height: number;
                  };
                  // Update the new window's dimensions
                  console.log("New window dimensions:", dimensions);
                  chrome.windows.update(newWindow.id ?? 0, {
                    width: dimensions.width,
                    height: dimensions.height,
                  });
                }
              }
            );
          }
        }
      );
    } else {
      console.error("Popup path not found in manifest.");
    }
  };

  return (
    <div className="h-full w-full flex flex-col justify-center items-stretch">
      {/* Top Bar */}
      <div className="flex justify-between items-center p-2 bg-gradient-to-r from-theme-accent to-theme-accent-hover shadow-md text-white">
        {/* App Name with Icon */}
        <div className="flex items-center space-x-2">
          {/* App Icon */}
          <div className="w-8 h-8 bg-theme-accent rounded-full flex items-center justify-center">
            {/* Placeholder for your app icon */}
            <svg
              viewBox="0 0 24 24"
              className="w-6 h-6 text-white fill-current"
            >
              {/* Your SVG icon here */}
            </svg>
          </div>
          {/* App Title */}
          <h1 className="text-xl font-bold tracking-wide animate-pulse">
            ByteBookmarks
          </h1>
        </div>
        {/* Window Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleMinimize}
            className="p-1 rounded-full hover:bg-theme-accent-hover transition duration-150 ease-in-out"
          >
            <IoRemove size={20} />
          </button>
          <button
            onClick={handleExport}
            className="p-1 rounded-full hover:bg-theme-accent-hover transition duration-150 ease-in-out"
          >
            <IoSquareOutline size={20} />
          </button>
          <button
            onClick={handleClose}
            className="p-1 rounded-full hover:bg-red-500 transition duration-150 ease-in-out"
          >
            <IoClose size={20} />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-grow ">{children}</div>

      {/* Bottom Navigation Bar */}
      <div className="block fixed inset-x-0 bottom-0 z-10 bg-white shadow">
        <div className="flex justify-between px-8">
          <NavIcon
            icon={<IoAddCircleOutline size={24} />}
            label="Add"
            isSpecial
            to="/bookmarks/add"
          />
          <NavIcon icon={<IoHomeOutline size={24} />} label="Home" />
          <NavIcon
            to="/bookmarks"
            icon={<IoBookmarkOutline size={24} />}
            label="Bookmarks"
          />
          <NavIcon
            to="/settings"
            icon={<IoSettingsOutline size={24} />}
            label="Settings"
          />
        </div>
      </div>
    </div>
  );
};

const NavIcon = ({ icon, label, isSpecial = false, to = "" }) => (
  <Link
    to={to}
    className={`flex flex-col items-center transition-colors duration-150 ease-in-out hover:scale-110 ${
      isSpecial
        ? "text-theme-accent hover:text-theme-accent-hover"
        : "text-theme-text hover:text-theme-accent"
    }`}
  >
    {icon}
    <span className="text-xs mt-1">{label}</span>
  </Link>
);
const AddBookmarkForm = () => {
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [pageImage, setPageImage] = useState(null); // State for storing the screenshot

  useEffect(() => {
    // Get the current active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];
      if (!currentTab) {
        console.error("No active tab found.");
        return;
      }
      setUrl(currentTab.url);
      setName(currentTab.title);

      // Request a screenshot from the background script for the current tab
      chrome.runtime.sendMessage(
        { action: "captureTab", tabId: currentTab.id },
        (response) => {
          if (response.error) {
            console.error("Error capturing tab:", response.error);
          } else {
            setPageImage(response.screenshotUrl);
          }
        }
      );
    });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Saving bookmark:", { name, url, pageImage });
  };

  return (
    <div className="p-4 w-screen h-screen bg-theme-card-bg rounded-lg shadow-theme-card">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Image Preview */}
        {pageImage && (
          <div className="flex justify-center">
            <img
              src={pageImage}
              alt="Page Screenshot"
              className="rounded-lg mb-4 max-w-full h-auto"
            />
          </div>
        )}

        <InputField
          label="Name"
          id="name"
          type="text"
          placeholder="Enter bookmark name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <InputField
          label="URL"
          id="url"
          type="url"
          placeholder="URL will be auto-populated"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          editable={false}
        />

        <button
          type="submit"
          className="w-full inline-flex justify-center px-4 py-2 text-sm font-medium text-theme-button-text bg-theme-accent rounded-theme-button hover:bg-theme-accent-hover transition duration-150 ease-in-out"
        >
          Add Bookmark
        </button>
      </form>
    </div>
  );
};

const AboutPanel = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-12 col-span-full bg-white rounded-lg shadow overflow-hidden">
      <button
        className="flex items-center justify-between w-full py-3 px-4 text-left text-theme-text bg-theme-input-bg transition-colors duration-150 ease-in-out hover:bg-theme-accent-hover"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-semibold">About</span>
        {isOpen ? <IoIosArrowUp size={24} /> : <IoIosArrowDown size={24} />}
      </button>

      {isOpen && (
        <div className="p-4 bg-theme-card-bg text-theme-text transition-max-height duration-500 ease-in-out">
          <p className="mb-2">Version: 1.0.0</p>
          <p className="mb-2">Developed by: Your Name</p>
          <p className="mb-2">
            A modern Chrome extension for managing bookmarks efficiently and
            securely.
          </p>
          <p>
            Contact:
            <a
              href="mailto:your-email@example.com"
              className="text-theme-accent hover:underline ml-1"
            >
              your-email@example.com
            </a>
          </p>
        </div>
      )}
    </div>
  );
};

const Settings = () => {
  const [theme, setTheme] = useState("Light");
  const [defaultPopupView, setDefaultPopupView] = useState("Home");
  const [autoSave, setAutoSave] = useState(false);
  const [autoAddTag, setAutoAddTag] = useState("");
  const [apiUrl, setApiUrl] = useState("");

  const themeOptions = ["Light", "Dark"];
  const defaultPopupViewOptions = ["Home", "Bookmarks", "Add Bookmark"];

  const handleLogout = () => {
    console.log("Logging out...");
  };

  const handleImportExport = (action) => {
    console.log(`${action} bookmarks...`);
  };

  return (
    <div className="p-4 w-full h-full bg-theme-card-bg grid grid-cols-1 md:grid-cols-2 gap-4">
      <h2 className="text-3xl font-bold text-theme-text col-span-full mb-6">
        Settings
      </h2>

      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <InputField
          label="Theme"
          id="theme"
          type="select"
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          options={themeOptions}
        />

        <InputField
          label="Default Popup View"
          id="defaultPopupView"
          type="select"
          value={defaultPopupView}
          onChange={(e) => setDefaultPopupView(e.target.value)}
          options={defaultPopupViewOptions}
        />
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <InputField
          label="Auto Add Tag"
          id="autoAddTag"
          type="text"
          placeholder="Enter default tag"
          value={autoAddTag}
          onChange={(e) => setAutoAddTag(e.target.value)}
        />

        <InputField
          label="API URL"
          id="apiUrl"
          type="url"
          placeholder="Enter API endpoint"
          value={apiUrl}
          onChange={(e) => setApiUrl(e.target.value)}
        />
      </div>

      <div className="col-span-full flex space-x-4">
        <button
          onClick={() => handleImportExport("Import")}
          className="py-3 px-6 bg-theme-button-bg text-theme-button-text rounded-lg hover:bg-theme-accent hover:text-white transition duration-150 ease-in-out"
        >
          Import Bookmarks
        </button>
        <button
          onClick={() => handleImportExport("Export")}
          className="py-3 px-6 bg-theme-button-bg text-theme-button-text rounded-lg hover:bg-theme-accent hover:text-white transition duration-150 ease-in-out"
        >
          Export Bookmarks
        </button>
        <button
          onClick={handleLogout}
          className="flex-grow inline-flex items-center justify-center py-3 bg-theme-button-bg text-theme-button-text rounded-lg hover:bg-theme-accent hover:text-white transition duration-150 ease-in-out"
        >
          <IoLogOutOutline className="mr-2" /> Log Out
        </button>
      </div>

      <AboutPanel />
    </div>
  );
};

const BookmarksPage = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [viewType, setViewType] = useState("latest");
  const [loading, setLoading] = useState(false);
  const [selectedTag, setSelectedTag] = useState("Work");
  const [selectedCategory, setSelectedCategory] = useState("Development");

  useEffect(() => {
    const fetchBookmarks = async () => {
      setLoading(true);
      try {
        let bookmarksData = [];
        switch (viewType) {
          case "latest":
            bookmarksData = await fetchLatestBookmarks();
            break;
          case "tag":
            bookmarksData = await fetchBookmarksByTag(selectedTag);
            break;
          case "category":
            bookmarksData = await fetchBookmarksByCategory(selectedCategory);
            break;
          default:
            bookmarksData = await fetchLatestBookmarks();
        }
        setBookmarks(bookmarksData);
      } catch (error) {
        console.error("Error fetching bookmarks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, [viewType, selectedTag, selectedCategory]);

  // Extract unique tags and categories from bookmarks data for filter options
  const uniqueTags = Array.from(
    new Set(bookmarksData.map((bookmark) => bookmark.tag))
  );
  const uniqueCategories = Array.from(
    new Set(bookmarksData.map((bookmark) => bookmark.category))
  );

  return (
    <div className="flex  flex-col h-full p-4 bg-theme-card-bg rounded-lg shadow-theme-card">
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-2xl font-bold text-theme-text">Bookmarks</h1>
        <div className="flex space-x-2">
          <select
            onChange={(e) => setViewType(e.target.value)}
            className="p-2 rounded-lg bg-theme-input-bg text-theme-input-text border-theme-border"
          >
            <option value="latest">Latest</option>
            <option value="tag">Tag</option>
            <option value="category">Category</option>
          </select>
          {viewType === "tag" && (
            <select
              onChange={(e) => setSelectedTag(e.target.value)}
              className="p-2 rounded-lg bg-theme-input-bg text-theme-input-text border-theme-border"
            >
              {uniqueTags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          )}
          {viewType === "category" && (
            <select
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="p-2 rounded-lg bg-theme-input-bg text-theme-input-text border-theme-border"
            >
              {uniqueCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center">
          <div className="spinner"></div>
        </div>
      ) : (
        <ul role="list" className="divide-y divide-theme-border">
          {bookmarks.map((bookmark) => (
            <li key={bookmark.id} className="py-4">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <img
                    className="w-10 h-10 rounded-lg"
                    src={bookmark.imageUrl || "https://via.placeholder.com/40"}
                    alt="Favicon"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <a
                    href={bookmark.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg font-medium text-theme-text truncate"
                  >
                    {bookmark.title}
                  </a>
                  <p className="text-sm text-theme-input-text truncate">
                    {bookmark.url}
                  </p>
                </div>
                <span className="inline-flex items-center text-sm font-semibold text-theme-accent">
                  {bookmark.category || bookmark.tag}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const bookmarksData = [
  {
    id: 1,
    title: "Bookmark 1",
    url: "https://example.com/1",
    tag: "Work",
    category: "Development",
    imageUrl: "https://via.placeholder.com/150",
  },
  {
    id: 2,
    title: "Bookmark 2",
    url: "https://example.com/2",
    tag: "Personal",
    category: "Entertainment",
    imageUrl: "https://via.placeholder.com/150",
  },
  {
    id: 3,
    title: "Bookmark 3",
    url: "https://example.com/3",
    tag: "Work",
    category: "Research",
    imageUrl: "https://via.placeholder.com/150",
  },
  {
    id: 4,
    title: "Bookmark 4",
    url: "https://example.com/4",
    tag: "Learning",
    category: "Development",
    imageUrl: "https://via.placeholder.com/150",
  },
  {
    id: 5,
    title: "Bookmark 5",
    url: "https://example.com/5",
    tag: "Personal",
    category: "Entertainment",
    imageUrl: "https://via.placeholder.com/150",
  },
];

// Dummy function for fetching latest bookmarks
const fetchLatestBookmarks = async () => {
  // Simulate a network request delay
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return bookmarksData; // Return all bookmarks as latest for demo
};

// Dummy function for fetching bookmarks by tag
const fetchBookmarksByTag = async (tag) => {
  // Simulate a network request delay
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return bookmarksData.filter((bookmark) => bookmark.tag === tag); // Filter bookmarks by tag
};

// Dummy function for fetching bookmarks by category
const fetchBookmarksByCategory = async (category) => {
  // Simulate a network request delay
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return bookmarksData.filter((bookmark) => bookmark.category === category); // Filter bookmarks by category
};
