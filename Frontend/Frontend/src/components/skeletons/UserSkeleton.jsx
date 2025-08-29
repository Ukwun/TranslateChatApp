import React from "react";

const UserSkeleton = () => {
	return (
		<div className='flex items-center gap-4 p-2'>
			<div className='skeleton w-12 h-12 rounded-full shrink-0'></div>
			<div className='flex flex-col gap-2 w-full'>
				<div className='skeleton h-4 w-28'></div>
			</div>
		</div>
	);
};

export default UserSkeleton;

