import React, { useCallback } from "react";
import { Link, useNavigate, } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import api from "../api/api";
import toast from "react-hot-toast";
import { LogOut } from "lucide-react";

const Navbar = () => {
	const { authUser, setAuthUser } = useAuthStore();
	const navigate = useNavigate();

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

		return (
			<header className='w-full fixed top-0 left-0 right-0 z-50 bg-base-100/80 backdrop-blur-sm shadow-lg'>
				<nav className='container mx-auto flex items-center justify-between px-4 h-16'>
					<div className='flex items-center'>
						<Link to='/' className='btn btn-ghost text-xl font-bold'>
							ChatApp
						</Link>
					</div>
					<div className='flex items-center'>
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
									Logout
								</button>
							</div>
						) : (
							<div className='flex items-center gap-2'>
								<Link to='/login' className='btn btn-sm btn-outline text-white'>
									Login
								</Link>
								<Link to='/signup' className='btn btn-sm btn-primary text-white'>
									Sign Up
								</Link>
							</div>
						)}
					</div>
				</nav>
			</header>
		);
};

export default Navbar;