
import { useRef, useState } from "react";
import { Camera, Settings } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";
import EditProfileModal from "../components/EditProfileModal";
import api from "../api/api.js";
import { Link, useNavigate } from "react-router-dom";
import { styled } from "goober";
import { useTranslation } from "react-i18next";

// Let's create a modern, rounded button using the `goober` CSS-in-JS library.
// This button has a clean look, a subtle shadow, and a nice hover effect.
const GoToChatButton = styled("button")`
	padding: 12px 24px;
	font-size: 1rem;
	font-weight: 600;
	color: white;
	background-color: black;
	border: none;
	border-radius: 50px;
	cursor: pointer;
	box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
	transition: all 0.3s ease;
	outline: none;

	&:hover {
		transform: translateY(-3px);
		background-color: #2a2a2a; /* A slightly lighter black for hover */
		box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
	}

	&:active {
		transform: translateY(-1px);
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
	}
`;


const ProfilePage = () => {
	const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
	const { t } = useTranslation();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
	const [roomName, setRoomName] = useState("");
	const [roomDesc, setRoomDesc] = useState("");
	const [creatingRoom, setCreatingRoom] = useState(false);
	const fileInputRef = useRef(null);
	const navigate = useNavigate();

	const handleImageUpload = async (e) => {
		const file = e.target.files[0];
		if (!file) return;
		await updateProfile({ profilePic: file });
	};

	const handleGoToChat = () => {
		navigate("/chat");
	};

	const handleCreateRoom = async (e) => {
		e.preventDefault();
		setCreatingRoom(true);
		try {
			await api.post("/rooms", { name: roomName, description: roomDesc });
			setRoomName("");
			setRoomDesc("");
			setIsCreateRoomOpen(false);
			toast.success("Room created successfully!");
			navigate("/admin-rooms");
		} catch (err) {
			toast.error(err.response?.data?.message || "Failed to create room");
		} finally {
			setCreatingRoom(false);
		}
	};

	return (
		<div className='flex justify-center items-start px-4 pt-20 pb-4 md:pt-24 md:pb-8'>
			<div className='w-full max-w-4xl mx-auto relative'>
				<Link to='/settings' className='absolute top-0 right-0 m-4 z-10' aria-label={t('settings')}>
					<button className='btn btn-ghost btn-circle'>
						<Settings className='w-6 h-6 text-white' />
					</button>
				</Link>
				<div className='bg-gray-800 rounded-lg shadow-lg p-6'>
					<div className='flex flex-col md:flex-row items-center md:items-start gap-8'>
						{/* Profile Picture Section */}
						<div className='relative group w-32 h-32 md:w-48 md:h-48 flex-shrink-0'>
							{isUpdatingProfile && (
								<div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full z-10'>
									<span className='loading loading-spinner loading-lg'></span>
								</div>
							)}
							<div className='absolute inset-0 flex items-center justify-center rounded-full bg-black'>
								<img
									src={authUser.profilePic || "/avatar-placeholder.png"}
									alt='Profile'
									className='w-full h-full object-cover rounded-full'
								/>
							</div>
							<input
								type='file'
								accept='image/*'
								ref={fileInputRef}
								onChange={handleImageUpload}
								className='hidden'
							/>
							<div
								className='absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded-full flex items-center justify-center cursor-pointer transition-opacity duration-300'
								onClick={() => !isUpdatingProfile && fileInputRef.current.click()}
							>
								<Camera className='w-8 h-8 text-white opacity-0 group-hover:opacity-100' />
							</div>
						</div>

						{/* User Info Section */}
						<div className='text-center md:text-left'>
							<h1 className='text-3xl md:text-4xl font-bold text-white'>{authUser.fullName}</h1>
							<p className='text-gray-400 mt-1'>@{authUser.username}</p>
							<p className='text-gray-300 mt-4'>
								{/* You can localize this bio text if needed */}
							</p>
						</div>
					</div>
				</div>

				{/* Account Information Section */}
				<div className='mt-8 bg-gray-800 rounded-lg shadow-lg p-6'>
					<div className='flex justify-between items-center mb-4'>
						<h2 className='text-xl font-semibold text-white'>{t('accountInfo')}</h2>
						<button className='btn btn-sm btn-outline btn-primary' onClick={() => setIsModalOpen(true)}>
							{t('editProfile')}
						</button>
					</div>
					<div className='space-y-4 text-sm'>
						<div className='flex items-center justify-between py-3 border-b border-gray-700'>
							<span className='text-gray-400'>{t('fullName')}</span>
							<span className='text-white font-medium'>{authUser.fullName}</span>
						</div>
						<div className='flex items-center justify-between py-3 border-b border-gray-700'>
							<span className='text-gray-400'>{t('email')}</span>
							<span className='text-white font-medium'>{authUser.email}</span>
						</div>
						<div className='flex items-center justify-between py-3 border-b border-gray-700'>
							<span className='text-gray-400'>Username</span>
							<span className='text-white font-medium'>@{authUser.username}</span>
						</div>
						<div className='flex items-center justify-between py-3'>
							<span className='text-gray-400'>{t('gender')}</span>
							<span className='text-white font-medium capitalize'>{authUser.gender}</span>
						</div>
					</div>
				</div>

						<div className='mt-8 flex justify-center gap-4'>
							<GoToChatButton onClick={handleGoToChat}>{t('chatRoom')}</GoToChatButton>
							<GoToChatButton style={{ backgroundColor: '#2563eb', marginLeft: '12px' }} onClick={() => setIsCreateRoomOpen(true)}>Create Room</GoToChatButton>
						</div>

						{/* Create Room Modal */}
						{isCreateRoomOpen && (
							<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
								<form onSubmit={handleCreateRoom} className="bg-white rounded-lg p-8 shadow-lg w-full max-w-md">
									<h2 className="text-xl font-bold mb-4 text-blue-700">Create a New Room</h2>
									<input
										type="text"
										placeholder="Room name"
										value={roomName}
										onChange={e => setRoomName(e.target.value)}
										required
										className="w-full mb-4 p-2 border rounded"
									/>
									<textarea
										placeholder="Room description"
										value={roomDesc}
										onChange={e => setRoomDesc(e.target.value)}
										className="w-full mb-4 p-2 border rounded"
									/>
									<div className="flex gap-4 justify-end">
										<button type="button" className="px-4 py-2 bg-gray-300 rounded" onClick={() => setIsCreateRoomOpen(false)}>Cancel</button>
										<button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" disabled={creatingRoom}>
											{creatingRoom ? "Creating..." : "Create Room"}
										</button>
									</div>
								</form>
							</div>
						)}
			</div>

			{isModalOpen && <EditProfileModal onClose={() => setIsModalOpen(false)} />}
		</div>
	);
};
export default ProfilePage;
