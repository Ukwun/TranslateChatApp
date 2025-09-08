
import React, { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/useAuthStore";
import { useTranslation } from "react-i18next";
import api from "../api/api";

const SignUpPage = () => {
  const { signup, isSigningUp, authUser } = useAuthStore();
  const { t } = useTranslation();
  const [inputs, setInputs] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "",
    language: "en", // Default language
  });
  const navigate = window.reactRouterNavigate || ((url) => window.location.assign(url));

  React.useEffect(() => {
    if (authUser && authUser._id) {
      navigate("/profile");
    }
  }, [authUser]);

  const handleChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // --- Validation ---
    if (!inputs.fullName.trim()) return toast.error(t('fullName') + ' ' + t('isRequired'));
    if (!inputs.username.trim()) return toast.error(t('username', 'Username') + ' ' + t('isRequired'));
    if (!inputs.email.trim()) return toast.error(t('email') + ' ' + t('isRequired'));
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputs.email);
    if (!emailOk) return toast.error(t('enterEmail'));
    if (!inputs.password) return toast.error(t('password') + ' ' + t('isRequired'));
    if (inputs.password.length < 6) {
      return toast.error(t('password') + ' ' + t('minLength'));
    }
    if (inputs.password !== inputs.confirmPassword) {
      return toast.error(t('passwordsDoNotMatch'));
    }

    if (!inputs.gender) {
      return toast.error(t('selectGender'));
    }
    try {
      await signup({
        fullName: inputs.fullName,
        username: inputs.username,
        email: inputs.email,
        password: inputs.password,
        gender: inputs.gender,
        language: inputs.language,
      });
      // Navigation will happen in useEffect above
    } catch (error) {
      console.error("Signup failed in component:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md text-gray-800">
  <h2 className="text-2xl font-bold text-center mb-6">{t('signup')}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('fullName')}</label>
            <input
              type="text"
              name="fullName"
              value={inputs.fullName}
              onChange={handleChange}
              placeholder={t('enterName')}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('username', 'Username')}</label>
            <input
              type="text"
              name="username"
              value={inputs.username}
              onChange={handleChange}
              placeholder={t('enterUsername', 'Enter username')}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('email')}</label>
            <input
              type="email"
              name="email"
              value={inputs.email}
              onChange={handleChange}
              placeholder={t('enterEmail')}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('password')}</label>
            <input
              type="password"
              name="password"
              value={inputs.password}
              onChange={handleChange}
              placeholder={t('enterPassword')}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('confirmPassword')}</label>
            <input
              type="password"
              name="confirmPassword"
              value={inputs.confirmPassword}
              onChange={handleChange}
              placeholder={t('confirmYourPassword')}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('gender')}</label>
            <select
              name="gender"
              value={inputs.gender}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              <option value="" disabled>{t('selectGender')}</option>
              <option value="male">{t('male')}</option>
              <option value="female">{t('female')}</option>
            </select>
          </div>
          {/* Language */}
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('language')}</label>
            <select
              name="language"
              value={inputs.language}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              <option value="en">English</option>
              <option value="ko">한국어 (Korean)</option>
              <option value="fr">Français</option>
              <option value="es">Español</option>
              <option value="de">Deutsch</option>
              <option value="zh">中文 (Chinese)</option>
              <option value="ja">日本語 (Japanese)</option>
              <option value="ru">Русский</option>
            </select>
          </div>
          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed"
            disabled={isSigningUp}
          >
            {isSigningUp ? t('signup') + '...' : t('signup')}
          </button>
        </form>

        <p className="mt-6 text-center text-sm opacity-80">
          {t('alreadyHaveAccount')} {" "}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            {t('login')}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;
