//
//  StartViewController.swift
//  WkWebView Demo
//
//  Created by Liao, Michael on 11/8/24.
//

import Foundation
import UIKit

class StartViewController: UIViewController {
    // Create a reference to the HostedWidgetView so it doesn't get destroyed when we navigate away.
    private var hostedWidgetViewController: HostedWidgetViewController?
    
    
    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .white
        title = "Main View"

        let button = UIButton(type: .system)
        button.setTitle("Go to Hosted Widget WebView", for: .normal)
        button.addTarget(self, action: #selector(goToSecondView), for: .touchUpInside)
        
        button.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(button)
        NSLayoutConstraint.activate([
            button.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            button.centerYAnchor.constraint(equalTo: view.centerYAnchor)
        ])
    }

    @objc func goToSecondView() {
        // Create hosted widget view if it doesn't already exist
        if hostedWidgetViewController == nil {
            hostedWidgetViewController = HostedWidgetViewController()
        }
        
        if let homeVC = hostedWidgetViewController {
            navigationController?.pushViewController(homeVC, animated: true)
        }
    }
}
