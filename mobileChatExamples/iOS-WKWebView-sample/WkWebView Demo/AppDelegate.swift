//
//  AppDelegate.swift
//  WkWebView Demo
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import UIKit

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
    func application(_: UIApplication,
                     didFinishLaunchingWithOptions _: [UIApplication.LaunchOptionsKey: Any]?) -> Bool
    {
        // Override point for customization after application launch.
        UIApplication.shared.registerForRemoteNotifications()
        return true
    }

    // MARK: UISceneSession Lifecycle

    func application(_: UIApplication,
                     configurationForConnecting connectingSceneSession: UISceneSession,
                     options _: UIScene.ConnectionOptions) -> UISceneConfiguration
    {
        // Called when a new scene session is being created.
        // Use this method to select a configuration to create the new scene with.
        return UISceneConfiguration(name: "Default Configuration", sessionRole: connectingSceneSession.role)
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
