package com.selenium.test;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;
import java.time.Duration;

public class SymbiosisRegistration {
    public static void main(String[] args) {
        
        WebDriver driver = new ChromeDriver();
        // Set a wait timer for up to 10 seconds
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        
        try {
            driver.get("http://127.0.0.1:5500/index.html");
            driver.manage().window().maximize();

            // Filling data
            driver.findElement(By.id("name")).sendKeys("nidhi Mangtani");
            driver.findElement(By.id("email")).sendKeys("nidhi@gmail.com");
            driver.findElement(By.id("password")).sendKeys("nidhi@2102");
            driver.findElement(By.id("confirmPassword")).sendKeys("nidhi@2102");

            // Select Gender & Course
            driver.findElement(By.xpath("//input[@value='Female']")).click();
            new Select(driver.findElement(By.id("course"))).selectByVisibleText("Computer Science");

            // CLICK REGISTER
            System.out.println("Clicking Register...");
            driver.findElement(By.className("btn-register")).click();

            // --- THE IMPORTANT PART ---
            // Wait until the Modal is VISIBLE on the screen
            WebElement successModal = wait.until(
                ExpectedConditions.visibilityOfElementLocated(By.id("successModal"))
            );

            if (successModal.isDisplayed()) {
                System.out.println("Success! Registration Popup is visible.");
                
                // Keep it on screen for 5 seconds so you can see it
                Thread.sleep(5000); 
                
                // Click the 'Proceed' button inside the popup
                driver.findElement(By.className("btn-done")).click();
            }

        } catch (Exception e) {
            System.out.println("Test encountered an issue: " + e.getMessage());
        } finally {
            driver.quit();
        }
    }
}