//
//  AppDelegate.swift
//  WkWebView Demo
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import UIKit
import UserNotifications

class AppDelegate: UIResponder, UIApplicationDelegate, UNUserNotificationCenterDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        
        UNUserNotificationCenter.current().delegate = self
        
        // Override point for customization after application launch.
            //UIApplication.shared.registerForRemoteNotifications()
        
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge]) { granted, error in
                if granted {
                    print("Notification authorization granted.")
                    UIApplication.shared.registerForRemoteNotifications()
                } else {
                    print("Notification authorization denied.")
                    // Handle the case where authorization is denied (e.g., disable notification-dependent features)
                }
                if let error = error {
                    print("Error requesting notification authorization: \(error.localizedDescription)")
                }
            }
        return true
    }
        
    func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        self.sendDeviceTokenToServer(data: deviceToken)
    }
    
    func application(_ application: UIApplication,
                     didFailToRegisterForRemoteNotificationsWithError
                     error: Error) {
        print("Failed to generate device token")
    }
    
    func sendDeviceTokenToServer(data: Data) {
        let token = data.map { String(format: "%02.2hhx", $0) }.joined()
        print("Generated device token: \(token)")
    }
    
    // fires when a notification comes and the app is in the foreground
    func userNotificationCenter(_ center: UNUserNotificationCenter, willPresent notification: UNNotification, withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
            let userInfo = notification.request.content.userInfo
            // Print message ID.
            print("will present \(userInfo)")

            let application = UIApplication.shared

             if(application.applicationState == .active){
               //Prints the message when user tapped the notification bar when the app is in foreground
                 print("app is active")
               //do not send when app is active
                 return
             }
        
             if(application.applicationState == .inactive)
             {
               completionHandler([.banner, .badge, .sound])
               print("user tapped the notification bar when the app is in background")
             }
        
            completionHandler([.banner, .badge, .sound])
            
        
        }
    
    // fires when user clicks on the notification
    func userNotificationCenter(_ center: UNUserNotificationCenter,
                                  didReceive response: UNNotificationResponse,
                                  withCompletionHandler completionHandler: @escaping () -> Void) {
        let userInfo = response.notification.request.content.userInfo
        print("did receive \(userInfo)")

        completionHandler()
    }
}

