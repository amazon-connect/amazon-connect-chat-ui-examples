//
//  StartViewController.swift
//  WkWebView Demo
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import Foundation
import UIKit

class StartViewController: UIViewController {
    // Create a reference to the ConnectWidgetView so it doesn't get destroyed when we navigate away.
    private var connectWidgetViewController: ConnectWidgetViewController?
    
    
    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .white
        title = "Main View"

        let button = UIButton(type: .system)
        button.setTitle("Go to Connect Widget WebView", for: .normal)
        button.addTarget(self, action: #selector(goToSecondView), for: .touchUpInside)
        
        button.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(button)
        NSLayoutConstraint.activate([
            button.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            button.centerYAnchor.constraint(equalTo: view.centerYAnchor)
        ])
    }

    @objc func goToSecondView() {
        // Create connect widget view if it doesn't already exist
        if connectWidgetViewController == nil {
            connectWidgetViewController = ConnectWidgetViewController()
        }
        
        if let homeVC = connectWidgetViewController {
            navigationController?.pushViewController(homeVC, animated: true)
        }
    }
}
