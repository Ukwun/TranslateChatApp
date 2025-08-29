
import React, { useCallback } from "react";
import { Link, useNavigate, } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import api from "../api/api";
import toast from "react-hot-toast";
import { LogOut } from "lucide-react";
import { useTranslation } from "react-i18next";

const Navbar = () => {
	const { authUser, setAuthUser } = useAuthStore();
	const navigate = useNavigate();
	const { t } = useTranslation();

	const handleLogout = useCallback(async () => {
		try {
			await api.post("/auth/logout");
			setAuthUser(null);
			navigate("/login");
			toast.success("Logged out successfully");
		} catch (error) {
			toast.error("Failed to log out");
		}
	}, [setAuthUser, navigate]);

		// Language switcher logic
		const [lang, setLang] = React.useState(localStorage.getItem('lang') || 'en');
		const handleLangChange = (e) => {
			setLang(e.target.value);
			localStorage.setItem('lang', e.target.value);
			window.location.reload(); // reload to apply language
		};

		return (
			<header className='w-full fixed top-0 left-0 right-0 z-50 bg-base-100/80 backdrop-blur-sm shadow-lg'>
				<nav className='container mx-auto flex items-center justify-between px-4 h-16'>
					<div className='flex items-center'>
						<Link to='/' className='btn btn-ghost text-xl font-bold'>
							{t('welcome')}
						</Link>
					</div>
					<div className='flex items-center gap-4'>
						<select value={lang} onChange={handleLangChange} className='select select-bordered select-sm bg-white text-gray-800 rounded-lg shadow border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all duration-150'>
							<option value='en'>English</option>
							<option value='ko'>한국어 (Korean)</option>
							<option value='fr'>Français</option>
							<option value='es'>Español</option>
							<option value='de'>Deutsch</option>
							<option value='zh'>中文 (Chinese)</option>
							<option value='ja'>日本語 (Japanese)</option>
							<option value='ru'>Русский</option>
						</select>
						{authUser ? (
							<div className='flex items-center gap-4'>
								<Link to='/profile' className='flex items-center gap-2 link link-hover text-white'>
									<div className='w-10 h-10 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden flex items-center justify-center bg-gray-800'>
										<img src={authUser.profilePic || "/avatar-placeholder.png"} alt='user avatar' className='w-full h-full object-cover rounded-full'/>
									</div>
									<span className='font-bold hidden sm:inline'>{authUser.fullName}</span>
								</Link>
								<button className='btn btn-sm btn-outline btn-error text-white' onClick={handleLogout}>
									<LogOut className='w-4 h-4' />
									{t('logout')}
								</button>
							</div>
						) : (
							<div className='flex items-center gap-2'>
								<Link to='/login' className='btn btn-sm btn-outline text-white'>
									{t('login')}
								</Link>
								<Link to='/signup' className='btn btn-sm btn-primary text-white'>
									{t('signup')}
								</Link>
							</div>
						)}
					</div>
				</nav>
			</header>
		);
};

export default Navbar;