package com.lms.serviceImpl;

import java.util.List;

import com.lms.dao.UserDao;
import com.lms.daoImpl.UserDaoImpl;
import com.lms.pojo.User;
import com.lms.service.UserService;

public class UserServiceImpl implements UserService {
	
	UserDao userDao = new UserDaoImpl();

	@Override
	public User checkLogin(String username, String password) {
		return userDao.checkLogin(username, password);
	}

	@Override
	public boolean addUser(User user) {
		return userDao.addUser(user);
	}

	@Override
	public List<User> getAllUserList() {
		return userDao.getAllUserList();
	}
	  @Override
	    public boolean registerUser(String fullname, String email, String password) {

	        // temporary dummy logic
	        System.out.println(fullname);
	        System.out.println(email);
	        System.out.println(password);

	        return true; // just for testing
	    }
	@Override
	public User getUserById(long userId) {
		return userDao.getUserById(userId);
	}

	@Override
	public boolean updateUser(User user) {
		return userDao.updateUser(user);
	}

}
