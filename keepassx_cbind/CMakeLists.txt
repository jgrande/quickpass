# Copyright (c) 2014 Juan Grande
#
# Redistribution and use in source and binary forms, with or without
# modification, are permitted provided that the following conditions are
# met:
# 
#     (1) Redistributions of source code must retain the above copyright
#     notice, this list of conditions and the following disclaimer. 
# 
#     (2) Redistributions in binary form must reproduce the above copyright
#     notice, this list of conditions and the following disclaimer in
#     the documentation and/or other materials provided with the
#     distribution.  
#     
#     (3)The name of the author may not be used to
#     endorse or promote products derived from this software without
#     specific prior written permission.
# 
# THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
# IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
# WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
# DISCLAIMED. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT,
# INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
# (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
# SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
# HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
# STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING
# IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
# POSSIBILITY OF SUCH DAMAGE. 

cmake_minimum_required(VERSION 2.8.11)

set(CBIND_NAME keepassx_cbind)
set(KEEPASSX_PREFIX keepassx)
set(KEEPASSX_SOURCE_DIR ${PROJECT_BINARY_DIR}/${KEEPASSX_PREFIX}/src/keepassx)
set(KEEPASSX_BINARY_DIR ${PROJECT_BINARY_DIR}/${KEEPASSX_PREFIX}/src/keepassx-build)

set(CMAKE_MODULE_PATH ${CMAKE_MODULE_PATH} ${CMAKE_CURRENT_SOURCE_DIR}/cmake)

include(ExternalProject)

set(KEEPASSX_VERSION 2.0-alpha6)

ExternalProject_Add(keepassx
	PREFIX ${KEEPASSX_PREFIX}
	GIT_REPOSITORY "https://github.com/keepassx/keepassx.git"
	GIT_TAG ${KEEPASSX_VERSION}
	PATCH_COMMAND git reset --hard && git apply --reject ${PROJECT_SOURCE_DIR}/keepassx.patch
	BUILD_COMMAND make keepassx_core
	INSTALL_COMMAND ""
)

# required libraries were copied from the main KeePassX
# CMakeLists.txt file and should be updated accordingly

set(QT_REQUIRED_MODULES QtCore QtGui QtTest)
if(UNIX AND NOT APPLE)
  set(QT_REQUIRED_MODULES ${QT_REQUIRED_MODULES} QtDBus)
endif()

find_package(Qt4 4.6.0 REQUIRED ${QT_REQUIRED_MODULES})
find_package(Gcrypt REQUIRED)
find_package(ZLIB REQUIRED)

include(${QT_USE_FILE})

include_directories(${KEEPASSX_SOURCE_DIR}/src)
link_directories(${KEEPASSX_BINARY_DIR}/src)

add_library(${CBIND_NAME} MODULE src/cbind.cpp)
target_link_libraries(${CBIND_NAME}
											keepassx_core
                      ${QT_QTCORE_LIBRARY}
                      ${QT_QTGUI_LIBRARY}
                      ${GCRYPT_LIBRARIES}
                      ${ZLIB_LIBRARIES})

if (UNIX)
	set_target_properties(${CBIND_NAME} PROPERTIES SUFFIX .${CMAKE_SYSTEM_NAME}_${CMAKE_SYSTEM_PROCESSOR}.so)
endif()

install(TARGETS ${CBIND_NAME}
				LIBRARY DESTINATION ${CMAKE_CURRENT_SOURCE_DIR}/../addon/data/lib
)
